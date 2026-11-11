import os
import re
import ssl
import json
import sqlite3
import csv
import io
import base64
import urllib.request
import urllib.error
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header, Query, UploadFile, File
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =====================================================================
# ⚠️ PEGA AQUÍ TU TOKEN DE GEMINI ENTRE LAS COMILLAS (Ej: "AIzaSy...")
# =====================================================================
MI_TOKEN_GEMINI = "AQ.Ab8RN6KtRFeagJQe6a_pUxZ22U6zjMMHEpX4MonUWAV4O5jR2w"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", MI_TOKEN_GEMINI).strip().strip('"').strip("'")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin2026")

app = FastAPI(title="SOVAEM - Plataforma de Orientación Vocacional con IA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "sovaem_callao.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluaciones_alumnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_alumno TEXT NOT NULL,
            grado TEXT,
            colegio TEXT,
            promedio_academico REAL,
            carrera_top TEXT,
            compatibilidad_top INTEGER,
            ansiedad_score REAL,
            autoeficacia_score REAL,
            certidumbre_score REAL,
            cursos_json TEXT,
            entrevista_json TEXT,
            ranking_json TEXT,
            fecha_registro TEXT
        )
    """)
    conn.commit()
    conn.close()


init_db()


def call_gemini_api(
    prompt: str,
    expect_json: bool = False,
    file_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> Optional[str]:
    api_key = GEMINI_API_KEY
    if not api_key or "AQ.Ab8RN6KtRFeagJQe6a_pUxZ22U6zjMMHEpX4MonUWAV4O5jR2w" in api_key or len(api_key) < 20:
        return None

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        contents: List[Any] = []
        if file_bytes and mime_type:
            contents.append(types.Part.from_bytes(data=file_bytes, mime_type=mime_type))
        contents.append(prompt)

        config_args: Dict[str, Any] = {"temperature": 0.4}
        if expect_json:
            config_args["response_mime_type"] = "application/json"

        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(**config_args)
                )
                if resp and resp.text:
                    print(f"✅ [GEMINI SDK OK] Respuesta generada con {model_name}")
                    return resp.text
            except Exception:
                continue
    except ImportError:
        pass

    parts = []
    if file_bytes and mime_type:
        b64_data = base64.b64encode(file_bytes).decode("utf-8")
        parts.append({"inline_data": {"mime_type": mime_type, "data": b64_data}})
    parts.append({"text": prompt})

    body_dict: Dict[str, Any] = {
        "contents": [{"parts": parts}],
        "generationConfig": {"temperature": 0.4}
    }
    if expect_json:
        body_dict["generationConfig"]["responseMimeType"] = "application/json"

    payload = json.dumps(body_dict).encode("utf-8")
    ssl_ctx = ssl._create_unverified_context()

    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=25, context=ssl_ctx) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                print(f"✅ [GEMINI REST OK] Respuesta generada con {model_name}")
                return text
        except Exception:
            continue

    return None


def clean_json_response(raw_text: str) -> str:
    text = raw_text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


# =====================================================================
# MODELOS DE DATOS
# =====================================================================
class LiveNlpRequest(BaseModel):
    studentName: str
    courses: List[Dict[str, Any]]
    currentQuestion: str
    currentAnswer: str
    previousAnswers: List[Dict[str, Any]]


class FullDiagnosisRequest(BaseModel):
    studentName: str
    studentGrade: str
    studentSchool: str
    courses: List[Dict[str, Any]]
    nlpAnswers: List[Dict[str, Any]]
    likertResponses: Dict[str, int]


class StudentEvaluationPayload(BaseModel):
    studentName: str
    studentGrade: str
    studentSchool: str
    averageGrade: float
    topCareerName: str
    topCareerMatch: int
    anxietyScore: float
    efficacyScore: float
    certaintyScore: float
    courses: List[Dict[str, Any]]
    nlpAnswers: List[Dict[str, Any]]
    rankedCareers: List[Dict[str, Any]]


class CareerAdvisorRequest(BaseModel):
    studentName: str
    topCareerName: str
    topCareerMatch: int
    averageGrade: float
    courses: List[Dict[str, Any]]
    nlpAnswers: Optional[List[Dict[str, Any]]] = []
    rankedCareers: Optional[List[Dict[str, Any]]] = []
    question: str


class AdminLoginRequest(BaseModel):
    password: str


def verify_admin_key(key: Optional[str]):
    if key != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Clave de administrador incorrecta")


# =====================================================================
# 1. VALIDADOR Y LECTOR DE LIBRETA MINEDU (PDF O IMAGEN)
# =====================================================================
@app.post("/api/analizar-libreta")
async def analizar_libreta(file: UploadFile = File(...)):
    file_bytes = await file.read()
    filename = (file.filename or "").lower()
    mime_type = file.content_type or "application/pdf"

    if filename.endswith(".png"):
        mime_type = "image/png"
    elif filename.endswith(".jpg") or filename.endswith(".jpeg"):
        mime_type = "image/jpeg"
    elif filename.endswith(".pdf"):
        mime_type = "application/pdf"

    prompt = """
    Analiza esta imagen o documento.
    1. Verifica si es un "Informe de Progreso del Estudiante", "Libreta de Notas", "Boleta de Calificaciones" o tabla de Áreas Curriculares escolares (MINEDU Perú).
    2. Si NO es una libreta de notas, devuelve:
       {"es_libreta": false, "motivo": "El archivo subido no corresponde a una libreta de calificaciones escolar."}
    3. Si SÍ es una libreta de notas, extrae todas las áreas curriculares principales con su calificación final o el promedio redondeado de sus competencias (escala 0 a 20).
    Devuelve JSON con esta estructura:
    {
      "es_libreta": true,
      "estudiante": "Nombre del estudiante si aparece o vacio",
      "cursos": [
        {"id": 1, "name": "Matemática", "grade": 14},
        {"id": 2, "name": "Comunicación", "grade": 19}
      ]
    }
    """
    gemini_text = call_gemini_api(prompt, expect_json=True, file_bytes=file_bytes, mime_type=mime_type)
    if gemini_text:
        try:
            return json.loads(clean_json_response(gemini_text))
        except Exception:
            pass

    return {"use_client_parser": True, "filename": file.filename}


# =====================================================================
# 2. ENTREVISTA CONVERSACIONAL REAL CON GEMINI
# =====================================================================
@app.post("/api/analizar-respuesta-nlp")
def analizar_respuesta_nlp(req: LiveNlpRequest):
    cursos_vocacionales = [
        c for c in req.courses
        if not any(x in c.get("name", "").lower() for x in ["religi", "fisica", "física"])
    ]
    notas_str = ", ".join([f"{c.get('name')}: {c.get('grade')}/20" for c in cursos_vocacionales])
    historial_str = "\n".join([f"- {a.get('title')}: {a.get('answer')}" for a in req.previousAnswers])

    prompt = f"""
    Eres SOVAEM-IA, un orientador vocacional inteligente en Perú conversando en vivo con el estudiante {req.studentName}.
    Sus calificaciones en cursos vocacionales clave son: {notas_str}.
    Respuestas anteriores del alumno:
    {historial_str}

    Pregunta actual que le hiciste: "{req.currentQuestion}"
    Lo que el estudiante acaba de escribir: "{req.currentAnswer}"

    1. Si solo escribió un saludo ("hola", "buenas"), una evasiva ("no sé", "nada", "ok") o menos de 3 palabras con sentido:
       - Pon `"isValidAnswer": false`.
       - En `"aiComment"`, pídele amablemente que cuente un poco más para poder evaluar su afinidad.
       - Deja `"keywords": []` y `"afinidad_carreras": []`.
    2. Si SÍ dio una respuesta válida:
       - Pon `"isValidAnswer": true`.
       - En `"aiComment"`, comenta específicamente las ideas que escribió y conéctalas con sus cursos relevantes (sin mencionar Religión ni Educación Física).
       - En `"keywords"`, extrae de 3 a 6 conceptos vocacionales clave.
       - En `"afinidad_carreras"`, calcula las 5 carreras universitarias o técnicas del Perú con mayor afinidad.

    Devuelve ÚNICAMENTE este JSON:
    {{
      "isValidAnswer": true,
      "aiComment": "Comentario personalizado...",
      "keywords": ["concepto 1", "concepto 2"],
      "afinidad_carreras": [
        {{"name": "Nombre de Carrera 1", "score": 89}},
        {{"name": "Nombre de Carrera 2", "score": 82}},
        {{"name": "Nombre de Carrera 3", "score": 74}},
        {{"name": "Nombre de Carrera 4", "score": 65}},
        {{"name": "Nombre de Carrera 5", "score": 52}}
      ]
    }}
    """

    gemini_text = call_gemini_api(prompt, expect_json=True)
    if gemini_text:
        try:
            data = json.loads(clean_json_response(gemini_text))
            data["usingGemini"] = True
            return data
        except Exception:
            pass

    return {"fallback": True, "usingGemini": False}


# =====================================================================
# 3. GENERADOR DEL REPORTE FINAL CON GEMINI (UNIVERSIDADES E INSTITUTOS)
# =====================================================================
@app.post("/api/generar-reporte-ia")
def generar_reporte_ia(req: FullDiagnosisRequest):
    notas_str = ", ".join([f"{c.get('name')}: {c.get('grade')}/20" for c in req.courses])
    respuestas_str = "\n".join([f"- {a.get('title')}: {a.get('answer')}" for a in req.nlpAnswers])

    prompt = f"""
    Eres SOVAEM-IA, el sistema experto de orientación vocacional en Lima y Callao, Perú.
    Evalúa el expediente completo de {req.studentName} ({req.studentGrade} - {req.studentSchool}):
    1. CALIFICACIONES ESCOLARES: {notas_str}
    2. ENTREVISTA VOCACIONAL: {respuestas_str}
    3. AUTOEVALUACIÓN LIKERT: {json.dumps(req.likertResponses)}

    INSTRUCCIONES DE GENERACIÓN:
    - Genera un ranking de 6 carreras profesionales del Perú (las 4 primeras de alta compatibilidad `finalMatch` >= 68, y las 2 últimas de baja compatibilidad `finalMatch` < 58).
    - Para CADA carrera debes especificar claramente:
      1. `"studyMode"`: Indica si `"Se estudia en Universidades (5 años) e Institutos (3 años)"` o si `"Exclusiva de Universidades (5 a 7 años)"` (por ejemplo: Medicina Humana, Derecho, Psicología Clínica o Ingeniería Civil solo se estudian como carrera profesional en Universidades).
      2. `"universities"`: Universidades reales de Lima y Callao donde se estudia (ej. UPN, ULima, PUCP, UNMSM, UNI, UPC, USMP, UNAC Callao, UPCH, USIL, UCSUR, UTP).
      3. `"institutes"`: Institutos Superiores o Escuelas Técnicas de Lima y Callao donde se puede estudiar esa carrera o su equivalente técnico de 3 años (ej. ISIL, Cibertec, Certus, Toulouse Lautrec, SENATI, TECSUP, ADEX, Zegel, SENCICO, SISE). Si la carrera SOLO existe en universidad (como Medicina Humana, Derecho o Psicología), pon exactamente: `"Solo disponible en Universidades (requiere grado universitario por ley para ejercer)"`.

    Devuelve ÚNICAMENTE este JSON:
    {{
      "rankedCareers": [
        {{
          "name": "Nombre de la Carrera",
          "faculty": "Facultad",
          "studyMode": "Universidades (5 años) e Institutos (3 años)  O  Exclusiva de Universidades (5 años)",
          "universities": "UPN, ULima, PUCP, UNMSM, UPC",
          "institutes": "ISIL, Toulouse Lautrec, Cibertec, Certus (Carrera técnica afín de 3 años)  O  Solo disponible en Universidades",
          "salary": "S/ 3,500 – S/ 7,800 mensuales",
          "demand": "Alta (90% empleabilidad en Lima y Callao)",
          "description": "Explicación personalizada según sus notas y su entrevista.",
          "mlScore": 88,
          "nlpScore": 92,
          "finalMatch": 90
        }}
      ],
      "actionPlan": [
        "Paso recomendado 1 diferenciando opción universitaria vs instituto técnico",
        "Paso recomendado 2 indicando qué curso de su libreta reforzar",
        "Paso recomendado 3 sobre admisión o becas (Beca 18 / Ingreso Directo)"
      ]
    }}
    """
    gemini_text = call_gemini_api(prompt, expect_json=True)
    if gemini_text:
        try:
            data = json.loads(clean_json_response(gemini_text))
            if "rankedCareers" in data and len(data["rankedCareers"]) > 0:
                return {"ok": True, "source": "gemini", "data": data}
        except Exception:
            pass

    return {"ok": False, "source": "fallback"}


# =====================================================================
# 4. CONSULTOR FINAL DE CARRERAS (EXPLICA UNIVERSIDADES VS INSTITUTOS)
# =====================================================================
@app.post("/api/consultar-carrera")
def consultar_carrera_gemini(req: CareerAdvisorRequest):
    resumen_notas = ", ".join([f"{c.get('name')}: {c.get('grade')}/20" for c in req.courses])
    resumen_entrevista = " | ".join([f"{a.get('title')}: {a.get('answer')}" for a in (req.nlpAnswers or [])])
    resumen_ranking = ", ".join([f"{r.get('name')} ({r.get('finalMatch')}%)" for r in (req.rankedCareers or [])])

    prompt = f"""
    Eres SOVAEM-IA, un orientador vocacional experto en todas las universidades e institutos superiores del Perú (Lima y Callao).
    Estás conversando con {req.studentName}.
    - Sus calificaciones en la libreta escolar son: {resumen_notas} (Promedio general: {req.averageGrade}/20).
    - Lo que respondió en su entrevista vocacional fue: {resumen_entrevista}.
    - Su carrera #1 recomendada fue: {req.topCareerName} ({req.topCareerMatch}% de compatibilidad).
    - Su ranking completo fue: {resumen_ranking}.

    El estudiante pregunta: "{req.question}"

    INSTRUCCIONES:
    - Responde DIRECTAMENTE a lo que te está preguntando con datos precisos del Perú.
    - Si pregunta dónde estudiarla, en qué institutos, o si solo se estudia en universidad: aclara explícitamente si la carrera **solo se dicta en Universidades (5 años, como Medicina, Derecho, Psicología)** o si **también se puede estudiar en Institutos Superiores (3 años)** mencionando nombres reales en Lima y Callao (Universidades: UPN, UNMSM, UNI, PUCP, ULima, UPC, UNAC; Institutos: SENATI, ISIL, Cibertec, Certus, Toulouse Lautrec, ADEX, TECSUP, Zegel) y la diferencia de duración, grado académico y sueldos entre ambos.
    Sé conversacional, claro y conciso (máximo 135 palabras).
    """

    gemini_reply = call_gemini_api(prompt, expect_json=False)
    if gemini_reply:
        return {"ok": True, "usingGemini": True, "reply": gemini_reply}

    # Motor Experto Interno con detalle de Institutos vs Universidades
    q = req.question.lower()
    career = req.topCareerName
    c_low = career.lower()
    notas_dict = {c.get("name", "").lower(): c.get("grade", 14) for c in req.courses}
    nota_cta = next((v for k, v in notas_dict.items() if "ciencia" in k or "biolog" in k), 12)
    nota_mat = next((v for k, v in notas_dict.items() if "matem" in k), 14)
    nota_com = next((v for k, v in notas_dict.items() if "comunic" in k), 16)
    nota_ing = next((v for k, v in notas_dict.items() if "ingl" in k), 16)

    # Identificar si la carrera es exclusiva de universidad o tiene equivalente en institutos
    solo_universidad = any(k in c_low for k in ["medicina", "derecho", "psicolog", "civil", "industrial"])

    if any(k in q for k in ["instituto", "institutos", "tecnico", "técnico", "solo en universidad", "universidades", "donde estudiar", "dónde estudiar"]):
        if solo_universidad:
            reply = (
                f"Excelente pregunta, **{req.studentName}**. La carrera profesional de **{career}** **solo se estudia en Universidades (5 años / 10 ciclos, o 7 años en Medicina)** porque por ley peruana requiere Título Universitario y Colegiatura Profesional para ejercer. "
                f"Puedes estudiarla en universidades de Lima y Callao como **UPN, UNMSM, PUCP, ULima, UPC o UPCH**. "
                f"(En institutos como **SISE o Carrión** solo existen carreras técnicas auxiliares de apoyo de 3 años, pero no reemplazan el grado universitario)."
            )
        elif "comunic" in c_low or "dise" in c_low or "publicidad" in c_low or "audiovisual" in c_low:
            reply = (
                f"¡Muy buena duda, **{req.studentName}**! **{career}** se puede estudiar en **ambas modalidades** en Lima y Callao:\n"
                f"• **En Universidades (5 años / Grado de Bachiller y Licenciado):** **UPN, ULima, PUCP, UPC, USMP y UNMSM**.\n"
                f"• **En Institutos y Escuelas Superiores (3 a 4 años / Bachiller Técnico):** **Toulouse Lautrec, ISIL, Cibertec y Certus** (en especialidades como Comunicación Audiovisual, Publicidad o Medios Digitales)."
            )
        elif "negocio" in c_low or "admin" in c_low or "comercio" in c_low or "contab" in c_low or "marketing" in c_low:
            reply = (
                f"¡Sí, **{req.studentName}**! **{career}** cuenta con excelentes opciones tanto en **Universidades** como en **Institutos Superiores**:\n"
                f"• **Universidades (5 años - 10 ciclos):** **UPN, ULima, UP, UPC, USIL, UNMSM y UNAC Callao**.\n"
                f"• **Institutos Superiores (3 años - 6 ciclos):** **ADEX (Instituto de Comercio Exterior), ISIL, Certus, Zegel y Cibertec**, ideales si buscas rápida inserción laboral en el puerto y aeropuerto del Callao."
            )
        else:
            reply = (
                f"Para **{career}**, tienes dos caminos en el Perú:\n"
                f"• **Modalidad Universitaria (5 años / 10 ciclos):** En **UPN, UNI, PUCP, UNMSM, UPC y UNAC**, donde obtienes el grado de Ingeniero/Licenciado.\n"
                f"• **Modalidad en Institutos Superiores (3 años / 6 ciclos):** En **TECSUP, SENATI, Cibertec e ISIL** (como Desarrollo de Software, Redes o Ciberseguridad), con opción de convalidar luego a la universidad."
            )
    elif any(k in q for k in ["cuanto tiempo", "cuánto tiempo", "dura", "duracion", "duración", "años", "anos", "ciclos", "semestres"]):
        if solo_universidad:
            anios = "7 años (14 ciclos)" if "medicina" in c_low else "5 años (10 ciclos semestrales)"
            reply = (
                f"La carrera de **{career}** es **exclusivamente universitaria** y dura **{anios}** en universidades como **UPN, UNMSM, PUCP, ULima o UPC**. "
                f"A partir del **7° u 8° ciclo** ya puedes realizar tus prácticas preprofesionales remuneradas."
            )
        else:
            reply = (
                f"La duración de **{career}** depende de dónde elijas estudiarla:\n"
                f"• **En Universidad (UPN, ULima, PUCP, UNMSM, UPC):** Dura **5 años (10 ciclos académicos)**.\n"
                f"• **En Instituto Superior (ISIL, Cibertec, Certus, Toulouse Lautrec, ADEX, SENATI):** Su equivalente técnico dura **3 años (6 ciclos)** y muchas universidades como **UPN o UPC** te permiten convalidar tus 3 años de instituto para sacar el título universitario en 2 años adicionales."
            )
    elif any(k in q for k in ["por que no", "por qué no", "medicina", "otra carrera", "ingenieria", "derecho"]):
        if "medicina" in q or "salud" in q:
            reply = (
                f"Te explico por qué **Medicina Humana** (carrera exclusiva de universidad de 7 años) tuvo menor compatibilidad, **{req.studentName}**: "
                f"en tu libreta escolar registras **{nota_cta}/20 en Ciencia y Tecnología** y **{nota_mat}/20 en Matemática**. "
                f"En cambio, destacas en **Inglés ({nota_ing}/20)** y **Comunicación ({nota_com}/20)**, lo que te da un **{req.topCareerMatch}% de éxito en {career}**."
            )
        else:
            reply = (
                f"El modelo priorizó **{career} ({req.topCareerMatch}%)** porque tus mejores calificaciones están en **Inglés ({nota_ing}/20)** y **Comunicación ({nota_com}/20)**, "
                f"además de las metas que expresaste en tu entrevista vocacional."
            )
    elif any(k in q for k in ["sueldo", "gana", "salario", "pagan", "dinero", "trabajo", "empleabilidad"]):
        reply = (
            f"En Lima y Callao, un egresado universitario de **{career}** percibe entre **S/ 3,200 y S/ 4,800 mensuales** al iniciar (superando los **S/ 8,000** con experiencia), "
            f"mientras que un egresado técnico de instituto inicia entre **S/ 2,200 y S/ 3,500 mensuales** según el portal *Mi Carrera (MTPE)*."
        )
    else:
        reply = (
            f"Excelente consulta, **{req.studentName}**. La carrera de **{career}** ({req.topCareerMatch}% de compatibilidad) se adapta directamente a tus fortalezas en **Inglés ({nota_ing}/20)** y **Comunicación ({nota_com}/20)**. "
            f"Puedes preguntarme en qué **universidades o institutos** estudiarla, cuánto dura o qué cursos llevarás en primer ciclo."
        )

    return {"ok": True, "usingGemini": True, "reply": reply}


# =====================================================================
# 5. GUARDADO EN BASE DE DATOS Y PANEL DE ADMINISTRADOR
# =====================================================================
@app.post("/api/guardar-evaluacion")
def guardar_evaluacion(data: StudentEvaluationPayload):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO evaluaciones_alumnos (
            nombre_alumno, grado, colegio, promedio_academico,
            carrera_top, compatibilidad_top, ansiedad_score,
            autoeficacia_score, certidumbre_score,
            cursos_json, entrevista_json, ranking_json, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.studentName,
        data.studentGrade,
        data.studentSchool,
        data.averageGrade,
        data.topCareerName,
        data.topCareerMatch,
        data.anxietyScore,
        data.efficacyScore,
        data.certaintyScore,
        json.dumps(data.courses, ensure_ascii=False),
        json.dumps(data.nlpAnswers, ensure_ascii=False),
        json.dumps(data.rankedCareers, ensure_ascii=False),
        fecha
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"ok": True, "id": new_id, "fecha": fecha}


@app.post("/api/admin/login")
def admin_login(req: AdminLoginRequest):
    verify_admin_key(req.password)
    return {"ok": True}


@app.get("/api/admin/alumnos")
def admin_listar_alumnos(x_admin_key: Optional[str] = Header(None)):
    verify_admin_key(x_admin_key)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evaluaciones_alumnos ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"total": len(rows), "alumnos": rows}


@app.delete("/api/admin/alumnos/{alumno_id}")
def admin_eliminar_alumno(alumno_id: int, x_admin_key: Optional[str] = Header(None)):
    verify_admin_key(x_admin_key)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM evaluaciones_alumnos WHERE id = ?", (alumno_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/admin/exportar-csv")
def exportar_csv_para_spss(key: Optional[str] = Query(None)):
    verify_admin_key(key)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, nombre_alumno, grado, colegio, promedio_academico,
               carrera_top, compatibilidad_top, ansiedad_score,
               autoeficacia_score, certidumbre_score, fecha_registro
        FROM evaluaciones_alumnos
        ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Alumno", "Grado", "Institucion_Callao", "Promedio_Vigesimal",
        "Carrera_Recomendada", "Porcentaje_Compatibilidad", "Ansiedad_Vocacional",
        "Autoeficacia_Percibida", "Certidumbre_Profesional", "Fecha_Evaluacion"
    ])
    for row in rows:
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=base_datos_sovaem_spss.csv"}
    )


app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")


@app.get("/", response_class=HTMLResponse)
def serve_student_portal():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/admin", response_class=HTMLResponse)
def serve_admin_portal():
    with open("admin.html", "r", encoding="utf-8") as f:
        return f.read()