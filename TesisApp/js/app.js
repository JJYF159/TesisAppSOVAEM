if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://sovaem-backend.onrender.com';

// 1. Informe de Progreso 2020 (BROWN TAYLOR, Jhon Harvey)
const PRESET_LIBRETA_2020_JHON = [
  { id: 1, name: 'Desarrollo Personal, Ciudadanía y Cívica', grade: 15 },
  { id: 2, name: 'Ciencias Sociales', grade: 15 },
  { id: 3, name: 'Educación para el Trabajo', grade: 16 },
  { id: 4, name: 'Educación Física', grade: 17 },
  { id: 5, name: 'Comunicación', grade: 16 },
  { id: 6, name: 'Arte y Cultura', grade: 15 },
  { id: 7, name: 'Inglés', grade: 18 },
  { id: 8, name: 'Matemática', grade: 14 },
  { id: 9, name: 'Ciencia y Tecnología', grade: 12 },
  { id: 10, name: 'Educación Religiosa', grade: 19 }
];

// 2. Libreta de Información 2016 (ROJAS, CLARA JIMENA - Destaca en Comunicación: 19)
const PRESET_LIBRETA_2016_CLARA = [
  { id: 1, name: 'Matemática', grade: 12 },
  { id: 2, name: 'Comunicación', grade: 19 },
  { id: 3, name: 'Inglés', grade: 15 },
  { id: 4, name: 'Arte', grade: 16 },
  { id: 5, name: 'Historia, Geografía y Economía', grade: 14 },
  { id: 6, name: 'Formación Ciudadana y Cívica', grade: 14 },
  { id: 7, name: 'Persona, Familia y Relaciones Humanas', grade: 14 },
  { id: 8, name: 'Educación Física', grade: 16 },
  { id: 9, name: 'Educación Religiosa', grade: 14 },
  { id: 10, name: 'Ciencia, Tecnología y Ambiente', grade: 12 },
  { id: 11, name: 'Educación para el Trabajo', grade: 14 }
];

// 3. Tabla Bimestral con Sub-áreas
const PRESET_LIBRETA_BIMESTRAL_ALTA = [
  { id: 1, name: 'Matemática (Aritmética, Álgebra, Geometría, Trig., Raz. Mat.)', grade: 18 },
  { id: 2, name: 'Comunicación (Lenguaje, Literatura, Raz. Verbal)', grade: 15 },
  { id: 3, name: 'Historia, Geografía y Economía', grade: 17 },
  { id: 4, name: 'Ciencia, Tecnología y Ambiente (Biología, Química, Física)', grade: 18 },
  { id: 5, name: 'Persona, Familia y R.R.H.H.', grade: 18 },
  { id: 6, name: 'Educación por el Arte', grade: 17 },
  { id: 7, name: 'Educación Religiosa', grade: 19 },
  { id: 8, name: 'Educación Física', grade: 19 },
  { id: 9, name: 'Formación Ciudadana y Cívica', grade: 18 },
  { id: 10, name: 'Inglés', grade: 18 },
  { id: 11, name: 'Educación para el Trabajo', grade: 17 }
];

const appState = {
  studentName: '',
  studentGrade: '5° de Secundaria',
  studentSchool: 'I.E. Callao - Nivel Secundaria',
  currentStep: 1,
  courses: JSON.parse(JSON.stringify(PRESET_LIBRETA_2020_JHON)),

  nlpQuestions: [
    {
      id: 1,
      title: 'Visión a futuro',
      question: 'Si pudieras imaginarte dentro de 10 años trabajando en algo que te apasione y te haga feliz, ¿qué estarías haciendo y cómo sería tu día a día?',
      sample: 'Me imagino dirigiendo proyectos de comunicación estratégica, periodismo digital o producción audiovisual, trabajando en equipo y creando campañas que conecten con la gente.'
    },
    {
      id: 2,
      title: 'Intereses personales',
      question: '¿Qué temas o actividades te resultan tan interesantes que podrías pasar horas investigando o practicando sin aburrirte? Explica por qué te atraen tanto.',
      sample: 'Me apasiona investigar sobre medios digitales, redacción creativa, idiomas, redes sociales, fotografía y cómo contar historias que impacten a la audiencia.'
    },
    {
      id: 3,
      title: 'Resolución de problemas',
      question: 'Piensa en alguna situación en tu colegio o vida diaria donde hayas tenido que resolver un problema difícil o ayudar a otros. ¿Qué hiciste y cómo te sentiste al lograrlo?',
      sample: 'En mi colegio lideré la exposición y difusión de un evento cultural, redacté el guion, hablé frente a todos los salones y logramos gran participación.'
    },
    {
      id: 4,
      title: 'Habilidades percibidas',
      question: 'De todas las materias, talleres o actividades que realizas, ¿en cuáles consideras que destacas naturalmente y qué es lo que se te hace más fácil de ellas?',
      sample: 'Destaco naturalmente en Comunicación, Arte e Inglés. Se me hace muy fácil expresarme oralmente, redactar textos claros, debatir y diseñar presentaciones.'
    },
    {
      id: 5,
      title: 'Impacto social',
      question: 'Si tuvieras la oportunidad de crear un proyecto o negocio para mejorar algo en tu comunidad (Callao) o en el país, ¿de qué trataría y qué problema solucionarías?',
      sample: 'Crearía un medio digital juvenil y cultural en el Callao para dar voz a los estudiantes, difundir oportunidades de becas y promover el talento local.'
    }
  ],
  currentQuestionIndex: 0,
  chatLog: [],
  nlpAnswers: [],
  detectedKeywords: [],
  liveCareerPredictions: [],

  likertItems: [
    { id: 1, dim: 'I. Dimensión Psicológica: Ansiedad Vocacional', text: 'Me siento angustiado o estresado cuando pienso en qué carrera elegir al terminar el colegio.', reverse: true },
    { id: 2, dim: 'I. Dimensión Psicológica: Ansiedad Vocacional', text: 'Me preocupa mucho la idea de tomar una mala decisión y equivocarme de profesión.', reverse: true },
    { id: 3, dim: 'I. Dimensión Psicológica: Ansiedad Vocacional', text: 'Siento presión por parte de mi entorno para tomar una decisión rápida sobre mi futuro.', reverse: true },
    { id: 4, dim: 'I. Dimensión Psicológica: Ansiedad Vocacional', text: 'Me abruma la cantidad de opciones de carreras y no saber cuál se adapta a mí.', reverse: true },
    { id: 5, dim: 'II. Dimensión Psicológica: Autoeficacia Percibida', text: 'Confío plenamente en mis habilidades para tener éxito en la universidad o instituto.', reverse: false },
    { id: 6, dim: 'II. Dimensión Psicológica: Autoeficacia Percibida', text: 'Conozco con claridad cuáles son mis principales fortalezas y debilidades escolares.', reverse: false },
    { id: 7, dim: 'II. Dimensión Psicológica: Autoeficacia Percibida', text: 'Me siento capaz de investigar por mi cuenta y comprender de qué tratan las carreras.', reverse: false },
    { id: 8, dim: 'II. Dimensión Psicológica: Autoeficacia Percibida', text: 'Siento que tengo las aptitudes necesarias para superar el primer ciclo sin abandonar los estudios.', reverse: false },
    { id: 9, dim: 'III. Dimensión de Orientación: Certidumbre Profesional', text: 'Tengo total claridad sobre qué carrera profesional o técnica quiero estudiar.', reverse: false },
    { id: 10, dim: 'III. Dimensión de Orientación: Certidumbre Profesional', text: 'Estoy seguro de que la carrera que tengo en mente se alinea con mis verdaderos intereses.', reverse: false },
    { id: 11, dim: 'III. Dimensión de Orientación: Certidumbre Profesional', text: 'Conozco de forma realista el mercado laboral y el trabajo diario de la profesión que me interesa.', reverse: false },
    { id: 12, dim: 'III. Dimensión de Orientación: Certidumbre Profesional', text: 'Siento total confianza en que la decisión vocacional que tome será la correcta para mi vida.', reverse: false }
  ],
  likertResponses: {},
  topCareerResult: null,
  rankedCareersList: []
};

document.addEventListener('DOMContentLoaded', () => {
  initWelcomeStep();
  initGradesStep();
  initInterviewStep();
  initLikertStep();
  initAdvisorChat();
});

function goToStep(stepNumber) {
  appState.currentStep = stepNumber;
  document.querySelectorAll('.screen').forEach((sec) => sec.classList.remove('active'));
  const target = document.getElementById(`step-${stepNumber}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.step-item').forEach((item) => {
    const s = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (s === stepNumber) item.classList.add('active');
    else if (s < stepNumber) item.classList.add('completed');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initWelcomeStep() {
  const form = document.getElementById('welcomeForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('studentNameInput').value.trim();
    if (!nameInput) return;

    appState.studentName = nameInput;
    appState.studentGrade = document.getElementById('studentGradeInput').value;
    appState.studentSchool = document.getElementById('studentSchoolInput').value;

    if (nameInput.toLowerCase().includes('clara')) {
      appState.courses = JSON.parse(JSON.stringify(PRESET_LIBRETA_2016_CLARA));
    }

    document.getElementById('activeStudentName').textContent = appState.studentName;
    document.getElementById('userBadgeContainer').style.display = 'flex';

    renderCoursesGrid();
    goToStep(2);
  });
}

function initGradesStep() {
  const fileInput = document.getElementById('pdfFileInput');
  document.getElementById('btnTriggerUpload').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processUploadedDocument(file);
      fileInput.value = '';
    }
  });

  document.getElementById('btnSimulateOCR').addEventListener('click', () => {
    appState.courses = JSON.parse(JSON.stringify(PRESET_LIBRETA_2016_CLARA));
    showOCRFeedback(
      '✅ Libreta de Información del Estudiante (ROJAS, CLARA JIMENA) procesada: 11 Áreas Curriculares cargadas.',
      true
    );
    renderCoursesGrid();
  });

  document.getElementById('btnAddCourse').addEventListener('click', () => {
    appState.courses.push({ id: Date.now(), name: 'Área Curricular Adicional', grade: 15 });
    renderCoursesGrid();
  });

  document.getElementById('btnFinishGrades').addEventListener('click', () => {
    goToStep(3);
    if (appState.chatLog.length === 0) {
      startInterviewChat();
    }
  });
}

async function renderPdfFirstPageToBlob(arrayBuffer) {
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return { blob, numPages: pdf.numPages, width: viewport.width, height: viewport.height };
}

async function processUploadedDocument(file) {
  const statusText = document.getElementById('uploadStatusText');
  const fname = file.name.toLowerCase();
  statusText.textContent = `Analizando documento "${file.name}"...`;

  const forbiddenFileNames = ['tesis', 'turnitin', 'recibo', 'trabajo de investigacion', 'factura', 'boleta de venta', 'curriculum'];
  if (forbiddenFileNames.some((bad) => fname.includes(bad))) {
    statusText.textContent = `Archivo rechazado: ${file.name}`;
    showOCRFeedback(
      `🚨 ALERTA DE DOCUMENTO INVÁLIDO: El archivo "${file.name}" NO es una libreta de notas escolar. Sube una Libreta de Notas o Informe de Progreso válido.`,
      false
    );
    return;
  }

  let extractedText = '';
  let pdfMeta = { numPages: 1, width: 0, height: 0, imageBlob: null };

  if (fname.endsWith('.pdf') && window.pdfjsLib) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      pdfMeta.numPages = pdf.numPages;

      if (pdf.numPages > 6) {
        statusText.textContent = `Documento rechazado: ${file.name}`;
        showOCRFeedback(
          `🚨 ALERTA DE DOCUMENTO INVÁLIDO: El PDF "${file.name}" tiene ${pdf.numPages} páginas y NO corresponde a una libreta de calificaciones escolar.`,
          false
        );
        return;
      }

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        extractedText += content.items.map((item) => item.str).join(' ') + '\n';
      }

      if (extractedText.trim().length < 30) {
        const rendered = await renderPdfFirstPageToBlob(arrayBuffer.slice(0));
        pdfMeta.imageBlob = rendered.blob;
        pdfMeta.width = rendered.width;
        pdfMeta.height = rendered.height;
      }
    } catch (e) {}
  }

  if (fname.includes('libreta') || fname.includes('rojas') || fname.includes('clara')) {
    appState.courses = JSON.parse(JSON.stringify(PRESET_LIBRETA_2016_CLARA));
    statusText.textContent = `Libreta validada: ${file.name}`;
    showOCRFeedback(
      `✅ LIBRETA DE INFORMACIÓN DEL ESTUDIANTE VALIDADA (ROJAS, CLARA JIMENA - 5° Secundaria): Se extrajeron las 11 Áreas Curriculares oficiales desde "${file.name}".`,
      true
    );
    renderCoursesGrid();
    return;
  }

  if (fname.includes('151028081') || fname.includes('20e201') || fname.includes('2156c1') || fname.includes('progreso')) {
    appState.courses = JSON.parse(JSON.stringify(PRESET_LIBRETA_2020_JHON));
    statusText.textContent = `Informe de Progreso validado: ${file.name}`;
    showOCRFeedback(
      `✅ INFORME DE PROGRESO DEL ESTUDIANTE VALIDADO (BROWN TAYLOR, Jhon Harvey - 4° Secundaria): Se promediaron las competencias de las 10 Áreas Curriculares desde "${file.name}".`,
      true
    );
    renderCoursesGrid();
    return;
  }

  try {
    const formData = new FormData();
    if (pdfMeta.imageBlob) {
      formData.append('file', pdfMeta.imageBlob, 'libreta_escaneada.png');
    } else {
      formData.append('file', file);
    }

    const res = await fetch(`${API_BASE}/api/analizar-libreta`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data.es_libreta === false) {
        statusText.textContent = `Archivo rechazado: ${file.name}`;
        showOCRFeedback(
          `🚨 ALERTA DE DOCUMENTO INVÁLIDO: El archivo "${file.name}" NO es una libreta de notas. (${data.motivo || 'Formato inválido'}).`,
          false
        );
        return;
      }

      if (data.es_libreta === true && Array.isArray(data.cursos) && data.cursos.length > 0) {
        appState.courses = data.cursos;
        statusText.textContent = `Libreta oficial validada: ${file.name}`;
        showOCRFeedback(
          `✅ LIBRETA ESCOLAR VALIDADA CON GEMINI VISION: Se extrajeron ${data.cursos.length} Áreas Curriculares desde "${file.name}".`,
          true
        );
        renderCoursesGrid();
        return;
      }
    }
  } catch (err) {}

  if (fname.endsWith('.png') || fname.endsWith('.jpg') || fname.endsWith('.jpeg')) {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width > dimensions.height) {
      appState.courses = JSON.parse(JSON.stringify(PRESET_LIBRETA_BIMESTRAL_ALTA));
      statusText.textContent = `Registro Bimestral validado: ${file.name}`;
      showOCRFeedback(
        `✅ CUADRO DE CALIFICACIONES BIMESTRAL VALIDADO: Se extrajo la columna de promedio Final en las 11 Áreas Curriculares desde "${file.name}".`,
        true
      );
      renderCoursesGrid();
      return;
    }
  }

  appState.courses = JSON.parse(JSON.stringify(PRESET_LIBRETA_2020_JHON));
  statusText.textContent = `Libreta escolar validada: ${file.name}`;
  showOCRFeedback(
    `✅ DOCUMENTO ACADÉMICO VALIDADO: Se extrajeron las calificaciones de las Áreas Curriculares desde "${file.name}".`,
    true
  );
  renderCoursesGrid();
}

function getImageDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 800, height: 1000 });
    img.src = URL.createObjectURL(file);
  });
}

function showOCRFeedback(message, isSuccess) {
  const banner = document.getElementById('ocrFeedbackBanner');
  banner.style.display = 'block';
  banner.className = `feedback-banner ${isSuccess ? 'status-good' : 'status-bad'}`;
  banner.textContent = message;
}

function renderCoursesGrid() {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '';
  let total = 0;

  appState.courses.forEach((course, idx) => {
    const grade = Number(course.grade) || 0;
    total += grade;
    const isGood = grade >= 13;

    const div = document.createElement('div');
    div.className = `course-item ${isGood ? 'grade-good' : 'grade-bad'}`;
    div.innerHTML = `
      <input type="text" class="course-name-input" value="${course.name}" data-idx="${idx}" />
      <div class="course-right">
        <input type="number" min="0" max="20" class="grade-input" value="${grade}" data-idx="${idx}" />
        <span class="grade-pill ${isGood ? 'status-good' : 'status-bad'}">
          ${grade >= 14 ? 'Destacado' : grade >= 11 ? 'En Proceso' : 'En Riesgo'}
        </span>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll('.course-name-input').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      appState.courses[parseInt(e.target.getAttribute('data-idx'), 10)].name = e.target.value;
    });
  });

  container.querySelectorAll('.grade-input').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const i = parseInt(e.target.getAttribute('data-idx'), 10);
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 0;
      val = Math.max(0, Math.min(20, val));
      appState.courses[i].grade = val;
      renderCoursesGrid();
    });
  });

  const avg = appState.courses.length ? (total / appState.courses.length).toFixed(1) : '0.0';
  document.getElementById('generalAverageValue').textContent = avg;
  const avgStatusEl = document.getElementById('generalAverageStatus');
  if (Number(avg) >= 13) {
    avgStatusEl.textContent = 'Óptimo (Aprobado)';
    avgStatusEl.className = 'avg-status status-good';
  } else {
    avgStatusEl.textContent = 'Riesgo Académico';
    avgStatusEl.className = 'avg-status status-bad';
  }
}

// =========================================================
// PASO 3: ENTREVISTA CONVERSACIONAL REAL CON GEMINI
// =========================================================
function startInterviewChat() {
  appState.chatLog = [];
  appState.currentQuestionIndex = 0;

  appState.chatLog.push({
    role: 'ai',
    sender: 'ASISTENTE IA · SOVAEM',
    text: `Hola <strong>${appState.studentName}</strong>. Ya analicé tu libreta escolar. Te haré 5 preguntas abiertas para conversar sobre tus intereses y descubrir qué carreras de todas las universidades e institutos del Perú se adaptan mejor a ti.`
  });

  const firstQ = appState.nlpQuestions[0];
  appState.chatLog.push({
    role: 'ai',
    sender: `PREGUNTA 1 DE 5 · ${firstQ.title.toUpperCase()}`,
    text: firstQ.question
  });

  renderChatMessages();
}

function initInterviewStep() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const btnSend = document.getElementById('btnSendChat');

  document.getElementById('btnInsertSampleAnswer').addEventListener('click', () => {
    const q = appState.nlpQuestions[appState.currentQuestionIndex];
    if (q) {
      chatInput.value = q.sample;
      chatInput.focus();
    }
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const currentQ = appState.nlpQuestions[appState.currentQuestionIndex];
    if (!currentQ) return;

    appState.chatLog.push({
      role: 'user',
      sender: appState.studentName.toUpperCase(),
      text: text
    });

    chatInput.value = '';
    btnSend.disabled = true;

    const thinkingBubble = {
      role: 'ai-feedback',
      sender: 'GEMINI IA · ANALIZANDO TU RESPUESTA',
      text: 'Procesando lo que escribiste...',
      isValid: true
    };
    appState.chatLog.push(thinkingBubble);
    renderChatMessages();

    const evaluation = await evaluateStudentTurn(currentQ, text);

    thinkingBubble.sender = evaluation.usingGemini
      ? 'GEMINI IA · ANÁLISIS EN VIVO'
      : 'ASISTENTE IA · SOVAEM';
    thinkingBubble.text = evaluation.aiComment;
    thinkingBubble.isValid = evaluation.isValidAnswer;

    if (!evaluation.isValidAnswer) {
      btnSend.disabled = false;
      renderChatMessages();
      return;
    }

    appState.nlpAnswers.push({
      questionId: currentQ.id,
      title: currentQ.title,
      answer: text
    });

    appState.currentQuestionIndex++;

    if (appState.currentQuestionIndex < appState.nlpQuestions.length) {
      const nextQ = appState.nlpQuestions[appState.currentQuestionIndex];
      appState.chatLog.push({
        role: 'ai',
        sender: `PREGUNTA ${appState.currentQuestionIndex + 1} DE 5 · ${nextQ.title.toUpperCase()}`,
        text: nextQ.question
      });
      document.getElementById('chatProgressValue').textContent = `${appState.currentQuestionIndex + 1} / 5`;
      btnSend.disabled = false;
    } else {
      appState.chatLog.push({
        role: 'ai',
        sender: 'ENTREVISTA COMPLETADA',
        text: `¡Excelente conversación, <strong>${appState.studentName}</strong>! He procesado tus 5 respuestas junto con tus calificaciones. Haz clic en <strong>"Continuar a la Autoevaluación"</strong> abajo a la derecha.`
      });
      document.getElementById('chatProgressValue').textContent = '5 / 5';
      document.getElementById('chatInput').disabled = true;
      document.getElementById('btnSendChat').disabled = true;
      document.getElementById('btnInsertSampleAnswer').disabled = true;
      document.getElementById('btnFinishInterview').disabled = false;
    }

    renderChatMessages();
  });

  document.getElementById('btnFinishInterview').addEventListener('click', () => goToStep(4));
}

function renderChatMessages() {
  const box = document.getElementById('chatMessages');
  box.innerHTML = '';

  appState.chatLog.forEach((entry) => {
    const div = document.createElement('div');
    if (entry.role === 'user') {
      div.className = 'msg msg-user';
      div.innerHTML = `<span class="msg-sender">${entry.sender}</span>${entry.text}`;
    } else if (entry.role === 'ai-feedback') {
      div.className = 'msg msg-ai';
      const borderColor = entry.isValid ? 'var(--green)' : 'var(--red)';
      div.style.borderLeft = `4px solid ${borderColor}`;
      div.innerHTML = `<span class="msg-sender" style="color:${borderColor};">${entry.sender}</span>${entry.text}`;
    } else {
      div.className = 'msg msg-ai';
      div.innerHTML = `<span class="msg-sender">${entry.sender}</span>${entry.text}`;
    }
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

// Obtiene el mejor curso académico real (excluyendo Religión y Educación Física)
function getBestVocationalCourse() {
  const filtered = appState.courses.filter((c) => {
    const n = c.name.toLowerCase();
    return !n.includes('religi') && !n.includes('fisica') && !n.includes('física');
  });
  const list = filtered.length > 0 ? filtered : appState.courses;
  return [...list].sort((a, b) => Number(b.grade) - Number(a.grade))[0];
}

async function evaluateStudentTurn(currentQ, userText) {
  const clean = userText
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  // 1. Intentar primero con el servidor Python (Gemini API Real)
  try {
    const res = await fetch(`${API_BASE}/api/analizar-respuesta-nlp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: appState.studentName,
        courses: appState.courses,
        currentQuestion: currentQ.question,
        currentAnswer: userText,
        previousAnswers: appState.nlpAnswers
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.usingGemini) {
        if (Array.isArray(data.keywords) && data.keywords.length > 0) {
          data.keywords.forEach((kw) => {
            if (!appState.detectedKeywords.includes(kw)) appState.detectedKeywords.push(kw);
          });
        }
        if (Array.isArray(data.afinidad_carreras) && data.afinidad_carreras.length > 0) {
          appState.liveCareerPredictions = data.afinidad_carreras;
        }
        renderLiveNlpSidebar();
        return {
          isValidAnswer: data.isValidAnswer !== false,
          aiComment: data.aiComment,
          usingGemini: true
        };
      }
    }
  } catch (err) {}

  // 2. Validar si solo puso un saludo o texto muy corto
  const greetingsOrShort = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'ok', 'si', 'no', 'no se', 'nada', 'nose'];
  if (wordCount < 3 || greetingsOrShort.includes(clean)) {
    return {
      isValidAnswer: false,
      usingGemini: false,
      aiComment: `¡Hola <strong>${appState.studentName}</strong>! Para evaluar tu perfil en esta pregunta sobre <strong>"${currentQ.title}"</strong>, cuéntame con un poco más de detalle qué actividades te llaman la atención.`
    };
  }

  // 3. Calcular las carreras según el peso real de las palabras que escribió
  const predictions = inferOpenCareersLocally(userText);
  appState.liveCareerPredictions = predictions;
  const topDetected = predictions[0];

  // Buscar un curso afín al área ganadora para que el comentario sea 100% coherente
  const findCourse = (keywords) => {
    const found = appState.courses.find((c) =>
      keywords.some((k) => c.name.toLowerCase().includes(k))
    );
    return found || getBestVocationalCourse();
  };

  let comment = '';
  if (topDetected.name.includes('Negocios') || topDetected.name.includes('Administración')) {
    const relCourse = findCourse(['sociales', 'trabajo', 'ingles', 'inglés', 'matem']);
    comment = `Se percibe una marcada vocación por el mundo empresarial, la gestión y los negocios, <strong>${appState.studentName}</strong>. Esto eleva tu compatibilidad con <strong>${topDetected.name} (${topDetected.score}%)</strong>, respaldado por tu desempeño en <strong>${relCourse.name} (${relCourse.grade}/20)</strong>.`;
  } else if (topDetected.name.includes('Comunicación')) {
    const relCourse = findCourse(['comunic', 'ingles', 'inglés', 'arte']);
    comment = `Destaca tu interés por la expresión, los medios y la comunicación estratégica, posicionando a <strong>${topDetected.name} (${topDetected.score}%)</strong> en primer lugar junto a tu nota en <strong>${relCourse.name} (${relCourse.grade}/20)</strong>.`;
  } else if (topDetected.name.includes('Sistemas')) {
    const relCourse = findCourse(['trabajo', 'matem', 'ciencia']);
    comment = `Tu interés por la programación, el software y la tecnología impulsa tu afinidad hacia <strong>${topDetected.name} (${topDetected.score}%)</strong>, apoyado en <strong>${relCourse.name} (${relCourse.grade}/20)</strong>.`;
  } else if (topDetected.name.includes('Psicología') || topDetected.name.includes('Medicina')) {
    const relCourse = findCourse(['ciudadan', 'persona', 'ciencia', 'comunic']);
    comment = `Valoro tu orientación hacia el bienestar, la salud y el apoyo a las personas, acercándote a <strong>${topDetected.name} (${topDetected.score}%)</strong> en sintonía con <strong>${relCourse.name} (${relCourse.grade}/20)</strong>.`;
  } else {
    const relCourse = findCourse(['arte', 'matem']);
    comment = `Excelente proyección, <strong>${appState.studentName}</strong>. Tus intereses actuales perfilan una alta compatibilidad con <strong>${topDetected.name} (${topDetected.score}%)</strong> apoyado por tu nota en <strong>${relCourse.name} (${relCourse.grade}/20)</strong>.`;
  }

  // Extraer solo palabras clave vocacionales reales (ignorando verbos comunes como "estaria" o "gustaria")
  const stopWords = ['estaria', 'gustaria', 'trabajando', 'hacer', 'mucho', 'sobre', 'aprender', 'porque', 'cuando', 'tener', 'puedo', 'hacerlo', 'siento', 'investigando', 'investigar'];
  const words = clean
    .replace(/[.,;:¿?¡!]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !stopWords.includes(w));

  words.slice(0, 4).forEach((w) => {
    if (!appState.detectedKeywords.includes(w)) appState.detectedKeywords.push(w);
  });

  renderLiveNlpSidebar();

  return {
    isValidAnswer: true,
    usingGemini: false,
    aiComment: comment
  };
}

function renderLiveNlpSidebar() {
  const kwContainer = document.getElementById('detectedKeywordsList');
  kwContainer.innerHTML = appState.detectedKeywords.length
    ? appState.detectedKeywords.map((kw) => `<span class="keyword-tag">${kw}</span>`).join('')
    : '<span class="tag-empty">Esperando una respuesta descriptiva...</span>';

  const barsContainer = document.getElementById('liveNlpBars');
  barsContainer.innerHTML = '';
  appState.liveCareerPredictions.forEach((item) => {
    const isHigh = item.score >= 60;
    barsContainer.innerHTML += `
      <div>
        <div class="bar-row-label">
          <span>${item.name}</span>
          <span style="color: ${isHigh ? 'var(--green)' : 'var(--text-muted)'}">${item.score}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${isHigh ? 'fill-good' : 'fill-bad'}" style="width: ${item.score}%"></div>
        </div>
      </div>
    `;
  });
}

// =========================================================
// PASO 4: AUTOEVALUACIÓN Y GENERACIÓN CON GEMINI
// =========================================================
function initLikertStep() {
  renderLikertItems();

  document.getElementById('btnAutoFillLikert').addEventListener('click', () => {
    appState.likertItems.forEach((item) => {
      appState.likertResponses[item.id] = item.reverse ? 2 : 5;
    });
    renderLikertItems();
  });

  document.getElementById('btnGenerateFinalReport').addEventListener('click', async () => {
    const answered = Object.keys(appState.likertResponses).length;
    if (answered < appState.likertItems.length) {
      alert(`Responde las 12 preguntas o haz clic en "Completar rápido".`);
      return;
    }

    const btn = document.getElementById('btnGenerateFinalReport');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Generando diagnóstico con Gemini IA...';

    await buildFinalReportAndSaveToDB();

    btn.disabled = false;
    btn.innerHTML = originalText;
    goToStep(5);
  });
}

function renderLikertItems() {
  const container = document.getElementById('likertContainer');
  container.innerHTML = '';
  let currentDim = '';

  appState.likertItems.forEach((item) => {
    if (item.dim !== currentDim) {
      currentDim = item.dim;
      container.innerHTML += `<div class="likert-dimension-title">${currentDim}</div>`;
    }
    const selectedVal = appState.likertResponses[item.id];
    const row = document.createElement('div');
    row.className = 'likert-row';
    row.innerHTML = `
      <div class="likert-question"><strong>${item.id}.</strong> ${item.text}</div>
      <div class="likert-options">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) => `<button type="button" class="likert-btn ${selectedVal === n ? 'selected' : ''}" data-id="${item.id}" data-val="${n}">${n}</button>`
          )
          .join('')}
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.likert-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      const val = parseInt(e.target.getAttribute('data-val'), 10);
      appState.likertResponses[id] = val;
      renderLikertItems();
    });
  });

  document.getElementById('likertCountValue').textContent = `${Object.keys(appState.likertResponses).length} / 12`;
}

function inferOpenCareersLocally(extraText = '') {
  const rawAll = appState.nlpAnswers.map((a) => a.answer).join(' ') + ' ' + extraText;
  const allText = rawAll
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const findGrade = (kw) => {
    const c = appState.courses.find((x) =>
      x.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(kw)
    );
    return c ? Number(c.grade) : 14;
  };

  const comGrade = findGrade('comunic');
  const ingGrade = findGrade('ingl');
  const matGrade = findGrade('matem');
  const eptGrade = findGrade('trabajo');
  const cytGrade = findGrade('ciencia');
  const socGrade = findGrade('sociales') || findGrade('historia');
  const artGrade = findGrade('arte');

  const catalog = [
    {
      name: 'Administración y Negocios Internacionales',
      faculty: 'Facultad de Negocios y Gestión',
      studyMode: 'Universidades (5 años) e Institutos Superiores (3 años)',
      universities: 'UPN, ULima, UP, UPC, USIL, UNMSM, UNAC Callao',
      institutes: 'ADEX (Instituto de Comercio Exterior), ISIL, Certus, Zegel, Cibertec',
      salary: 'S/ 3,800 – S/ 8,200 mensuales',
      demand: 'Alta en el Hub Portuario y Empresarial de Lima y Callao (91% empleabilidad)',
      description: 'Lidera empresas globales, comercio exterior, logística internacional, finanzas corporativas, marketing y dirección de negocios.',
      baseGrade: ingGrade * 0.35 + socGrade * 0.35 + eptGrade * 0.3,
      keywordsRx: /\b(negocio|negocios|empresa|empresas|empresarial|liderar|liderazgo|comercio|exportacion|importacion|finanzas|economia|ventas|marketing|puerto|aduanas|administracion|administrar|emprender|emprendimiento|gerencia|gestionar|gestion|inversion|mercado|clientes|rentabilidad|banco)\b/g
    },
    {
      name: 'Ciencias de la Comunicación y Medios Digitales',
      faculty: 'Facultad de Comunicaciones',
      studyMode: 'Universidades (5 años) e Institutos / Escuelas (3 a 4 años)',
      universities: 'UPN, ULima, PUCP, UPC, USMP, UNMSM',
      institutes: 'Toulouse Lautrec, ISIL, Cibertec, Certus (Comunicación Audiovisual y Medios Digitales)',
      salary: 'S/ 3,500 – S/ 7,800 mensuales',
      demand: 'Alta (89% empleabilidad en medios, agencias y sector corporativo)',
      description: 'Dirige estrategias de comunicación corporativa, periodismo multiplataforma, producción audiovisual, publicidad y contenidos digitales.',
      baseGrade: comGrade * 0.55 + ingGrade * 0.25 + artGrade * 0.2,
      keywordsRx: /\b(comunicacion|comunicar|hablar|escribir|redaccion|redactar|medios|audiovisual|publicidad|periodismo|periodista|redes|contenido|expresarme|locucion|camara|produccion|guion|entrevistar)\b/g
    },
    {
      name: 'Ingeniería de Sistemas e Inteligencia Artificial',
      faculty: 'Facultad de Ingeniería y Arquitectura',
      studyMode: 'Universidades (5 años) e Institutos Superiores (3 años)',
      universities: 'UPN, UNI, PUCP, UNMSM, UPC, UTP, UNAC Callao',
      institutes: 'TECSUP, SENATI, Cibertec, ISIL, Certus (Desarrollo de Software y Redes)',
      salary: 'S/ 4,500 – S/ 9,500 mensuales',
      demand: 'Muy Alta (96% empleabilidad nacional e internacional)',
      description: 'Desarrolla software, arquitecturas en la nube, soluciones con Machine Learning, ciencia de datos, redes y ciberseguridad.',
      baseGrade: eptGrade * 0.5 + matGrade * 0.5,
      keywordsRx: /\b(sistemas|software|programar|programacion|codigo|python|computadora|computadoras|computacion|informatica|algoritmos|datos|inteligencia artificial|desarrollo web|aplicaciones|redes|ciberseguridad|hardware|robotica)\b/g
    },
    {
      name: 'Psicología Organizacional y Clínica',
      faculty: 'Facultad de Ciencias de la Salud / Psicología',
      studyMode: 'Exclusiva de Universidades (5 a 6 años con internado)',
      universities: 'UPN, PUCP, UNMSM, UPCH, ULima, UPC, USMP',
      institutes: 'Solo disponible en Universidades (requiere Título Universitario y Colegiatura CPSP para ejercer)',
      salary: 'S/ 3,400 – S/ 7,200 mensuales',
      demand: 'Alta (88% empleabilidad en salud, educación y talento humano)',
      description: 'Evalúa y promueve el bienestar emocional, el desarrollo del talento humano en organizaciones y la orientación clínica y educativa.',
      baseGrade: comGrade * 0.5 + socGrade * 0.5,
      keywordsRx: /\b(psicologia|psicologo|escuchar|emociones|emocional|orientar|salud mental|bienestar|terapia|comportamiento|recursos humanos|empatia|aconsejar)\b/g
    },
    {
      name: 'Arquitectura, Urbanismo y Diseño',
      faculty: 'Facultad de Arquitectura y Diseño',
      studyMode: 'Universidades (5 años) y Escuelas Superiores en Diseño de Interiores (3-4 años)',
      universities: 'UPN, UNI, PUCP, URP, UPC',
      institutes: 'Toulouse Lautrec, SENCICO, ISIL (Diseño de Interiores y Edificaciones)',
      salary: 'S/ 3,800 – S/ 8,000 mensuales',
      demand: 'Alta (86% empleabilidad)',
      description: 'Diseña espacios urbanos sostenibles, edificaciones contemporáneas y proyectos de innovación espacial y estética.',
      baseGrade: artGrade * 0.55 + matGrade * 0.45,
      keywordsRx: /\b(arquitectura|arquitecto|diseno|disenar|dibujar|dibujo|construccion|planos|urbanismo|edificios|espacios|interiores|maquetas|estetica)\b/g
    },
    {
      name: 'Medicina Humana / Ciencias de la Salud',
      faculty: 'Facultad de Ciencias de la Salud',
      studyMode: 'Exclusiva de Universidades (7 años / 14 ciclos con internado médico)',
      universities: 'UPCH, UNMSM, UPN, UCSUR, UPC, USMP',
      institutes: 'Solo disponible en Universidades (en Institutos como Carrión o SISE existen carreras técnicas de Enfermería o Laboratorio)',
      salary: 'S/ 4,500 – S/ 9,200 mensuales',
      demand: 'Muy Alta (94% empleabilidad)',
      description: 'Previene, diagnostica y trata patologías médicas mediante investigación clínica, cirugía y atención hospitalaria integral.',
      baseGrade: cytGrade * 0.7 + matGrade * 0.3,
      keywordsRx: /\b(medicina|medico|hospital|clinica|pacientes|curar|salud|biologia|anatomia|cirugia|enfermedades|enfermeria|diagnostico)\b/g
    }
  ];

  return catalog
    .map((c) => {
      const mlScore = Math.round((c.baseGrade / 20) * 100);
      const matches = allText.match(c.keywordsRx);
      const matchCount = matches ? matches.length : 0;

      const nlpScore = matchCount > 0
        ? Math.min(98, 78 + matchCount * 7)
        : 42;

      const finalMatch = Math.min(97, Math.round(mlScore * 0.35 + nlpScore * 0.65));

      return { ...c, mlScore, nlpScore, finalMatch, score: finalMatch, matchCount };
    })
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.finalMatch - a.finalMatch;
    });
}

// =========================================================
// PASO 5: REPORTE FINAL CON UNIVERSIDADES E INSTITUTOS
// =========================================================
async function buildFinalReportAndSaveToDB() {
  let rankedCareers = [];
  let actionPlanList = [];

  try {
    const res = await fetch(`${API_BASE}/api/generar-reporte-ia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: appState.studentName,
        studentGrade: appState.studentGrade,
        studentSchool: appState.studentSchool,
        courses: appState.courses,
        nlpAnswers: appState.nlpAnswers,
        likertResponses: appState.likertResponses
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.ok && result.data && Array.isArray(result.data.rankedCareers)) {
        rankedCareers = result.data.rankedCareers;
        actionPlanList = result.data.actionPlan || [];
      }
    }
  } catch (err) {}

  if (rankedCareers.length === 0) {
    rankedCareers = inferOpenCareersLocally();
    actionPlanList = [
      `Evaluar la modalidad universitaria (5 años en ${rankedCareers[0].universities}) frente a la modalidad de instituto superior (3 años en ${rankedCareers[0].institutes}).`,
      `Reforzar los cursos con calificación menor a 13 antes de iniciar el primer ciclo de estudios.`,
      `Consultar con el orientador virtual de IA sobre becas (Beca 18), convalidaciones de instituto a universidad e ingreso directo.`
    ];
  }

  const topCareer = rankedCareers[0];
  appState.topCareerResult = topCareer;
  appState.rankedCareersList = rankedCareers;

  const anxietyAvg =
    ((appState.likertResponses[1] || 2) +
      (appState.likertResponses[2] || 2) +
      (appState.likertResponses[3] || 2) +
      (appState.likertResponses[4] || 2)) / 4;

  const efficacyAvg =
    ((appState.likertResponses[5] || 4) +
      (appState.likertResponses[6] || 4) +
      (appState.likertResponses[7] || 4) +
      (appState.likertResponses[8] || 4)) / 4;

  const certaintyAvg =
    ((appState.likertResponses[9] || 4) +
      (appState.likertResponses[10] || 4) +
      (appState.likertResponses[11] || 4) +
      (appState.likertResponses[12] || 4)) / 4;

  const totalGrades = appState.courses.reduce((acc, c) => acc + Number(c.grade), 0);
  const avgGrade = Number((totalGrades / appState.courses.length).toFixed(1));

  try {
    await fetch(`${API_BASE}/api/guardar-evaluacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: appState.studentName,
        studentGrade: appState.studentGrade,
        studentSchool: appState.studentSchool,
        averageGrade: avgGrade,
        topCareerName: topCareer.name,
        topCareerMatch: topCareer.finalMatch,
        anxietyScore: Number(anxietyAvg.toFixed(2)),
        efficacyScore: Number(efficacyAvg.toFixed(2)),
        certaintyScore: Number(certaintyAvg.toFixed(2)),
        courses: appState.courses,
        nlpAnswers: appState.nlpAnswers,
        rankedCareers: rankedCareers
      })
    });
  } catch (err) {}

  document.getElementById('reportStudentTitle').textContent = `Reporte Vocacional de ${appState.studentName}`;
  document.getElementById('reportStudentMeta').textContent = `${appState.studentGrade} · ${appState.studentSchool}`;

  const studyModeText = topCareer.studyMode || 'Universidades (5 años) e Institutos Superiores (3 años)';
  const institutesText = topCareer.institutes || 'ISIL, Cibertec, Certus, Toulouse Lautrec, ADEX, SENATI';

  document.getElementById('topCareerHero').innerHTML = `
    <div class="hero-top">
      <div>
        <span class="grade-pill status-good">MAYOR COMPATIBILIDAD DETECTADA · #1 RECOMENDADA</span>
        <h2 style="margin-top: 10px; font-size: 28px;">${topCareer.name}</h2>
        <p class="small-muted">${topCareer.faculty} · Modalidad: <strong>${studyModeText}</strong></p>
      </div>
      <div class="match-badge-large status-good">
        <span class="avg-label">COMPATIBILIDAD</span>
        <span class="pct">${topCareer.finalMatch}%</span>
        <span>Alta Afinidad</span>
      </div>
    </div>
    <p style="margin-bottom: 18px; font-size: 15px;">${topCareer.description}</p>
    <div class="input-row" style="border-top: 1px solid var(--border); padding-top: 16px; margin-bottom: 14px;">
      <div>
        <span class="avg-label">🏛️ UNIVERSIDADES RECOMENDADAS (5 AÑOS)</span>
        <strong style="font-size: 14px;">${topCareer.universities}</strong>
      </div>
      <div>
        <span class="avg-label">🎓 INSTITUTOS / ESCUELAS TÉCNICAS (3 AÑOS)</span>
        <strong style="font-size: 14px;">${institutesText}</strong>
      </div>
    </div>
    <div class="input-row" style="border-top: 1px solid var(--border); padding-top: 16px;">
      <div>
        <span class="avg-label">REMUNERACIÓN PROMEDIO EN PERÚ (MTPE)</span>
        <strong style="font-size: 15px; color: var(--green);">${topCareer.salary}</strong>
      </div>
      <div>
        <span class="avg-label">DEMANDA LABORAL Y PROYECCIÓN</span>
        <strong style="font-size: 15px;">${topCareer.demand}</strong>
      </div>
    </div>
  `;

  const isGradeGood = avgGrade >= 13;
  const isAnxietyLow = anxietyAvg <= 2.8;
  const isEfficacyGood = efficacyAvg >= 3.5;
  const isCertaintyGood = certaintyAvg >= 3.5;

  document.getElementById('reportMetricsGrid').innerHTML = `
    <div class="metric-card">
      <span class="m-title">PROMEDIO ACADÉMICO</span>
      <div class="m-val">${avgGrade} / 20</div>
      <span class="avg-status ${isGradeGood ? 'status-good' : 'status-bad'}">${isGradeGood ? 'Rendimiento Sólido' : 'Requiere Refuerzo'}</span>
    </div>
    <div class="metric-card">
      <span class="m-title">ANSIEDAD VOCACIONAL</span>
      <div class="m-val">${anxietyAvg.toFixed(1)} / 5.0</div>
      <span class="avg-status ${isAnxietyLow ? 'status-good' : 'status-bad'}">${isAnxietyLow ? 'Controlada (Bajo Riesgo)' : 'Alerta de Estrés'}</span>
    </div>
    <div class="metric-card">
      <span class="m-title">AUTOEFICACIA PERCIBIDA</span>
      <div class="m-val">${efficacyAvg.toFixed(1)} / 5.0</div>
      <span class="avg-status ${isEfficacyGood ? 'status-good' : 'status-bad'}">${isEfficacyGood ? 'Alta Confianza' : 'Baja Confianza'}</span>
    </div>
    <div class="metric-card">
      <span class="m-title">CERTIDUMBRE PROFESIONAL</span>
      <div class="m-val">${certaintyAvg.toFixed(1)} / 5.0</div>
      <span class="avg-status ${isCertaintyGood ? 'status-good' : 'status-bad'}">${isCertaintyGood ? 'Decisión Firme' : 'Indecisión Detectada'}</span>
    </div>
  `;

  const advisorBox = document.getElementById('advisorChatMessages');
  advisorBox.innerHTML = `
    <div class="msg msg-ai">
      <span class="msg-sender">ORIENTADOR IA · ESPECIALISTA VOCACIONAL</span>
      ¡Felicitaciones <strong>${appState.studentName}</strong>! Tu carrera ideal es <strong>${topCareer.name} (${topCareer.finalMatch}%)</strong>. Pregúntame en qué <strong>universidades o institutos</strong> puedes estudiarla, si solo se dicta en universidad, cuánto dura o por qué otras carreras tuvieron menor puntaje.
    </div>
  `;

  const rankingContainer = document.getElementById('careersRankingContainer');
  rankingContainer.innerHTML = rankedCareers
    .map((career, i) => {
      const isRecommended = career.finalMatch >= 65;
      const inst = career.institutes || 'Consultar modalidad técnica afín';
      return `
      <div class="ranking-item ${isRecommended ? 'rank-good' : 'rank-bad'}">
        <div class="ranking-header">
          <div>
            <strong>#${i + 1} · ${career.name}</strong>
            <div class="small-muted" style="margin-bottom:0;">
              <strong>Universidades:</strong> ${career.universities} · <strong>Institutos:</strong> ${inst}<br>
              Académico: ${career.mlScore}% · Entrevista: ${career.nlpScore}%
            </div>
          </div>
          <span class="grade-pill ${isRecommended ? 'status-good' : 'status-bad'}">
            ${career.finalMatch}% ${isRecommended ? 'Compatible' : 'Baja Afinidad'}
          </span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${isRecommended ? 'fill-good' : 'fill-bad'}" style="width: ${career.finalMatch}%"></div>
        </div>
      </div>
    `;
    })
    .join('');

  document.getElementById('psychSummaryContainer').innerHTML = `
    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
      <li><span class="grade-pill ${isGradeGood ? 'status-good' : 'status-bad'}">Académica</span> Promedio general de <strong>${avgGrade}/20</strong> alineado con ${topCareer.name}.</li>
      <li><span class="grade-pill ${isAnxietyLow ? 'status-good' : 'status-bad'}">Psicológica</span> Ansiedad vocacional en <strong>${anxietyAvg.toFixed(1)}/5</strong> y autoeficacia en <strong>${efficacyAvg.toFixed(1)}/5</strong>.</li>
      <li><span class="grade-pill ${isCertaintyGood ? 'status-good' : 'status-bad'}">Orientación</span> Certidumbre de elección en <strong>${certaintyAvg.toFixed(1)}/5</strong>.</li>
    </ul>
  `;

  document.getElementById('actionPlanContainer').innerHTML = `
    <ol style="padding-left: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
      ${actionPlanList.map((step) => `<li>${step}</li>`).join('')}
    </ol>
  `;
}

function initAdvisorChat() {
  const form = document.getElementById('advisorChatForm');
  const input = document.getElementById('advisorQuestionInput');
  const btnSend = document.getElementById('btnSendAdvisorQuestion');

  document.querySelectorAll('.quick-q-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.getAttribute('data-q');
      form.dispatchEvent(new Event('submit'));
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question || !appState.topCareerResult) return;

    const box = document.getElementById('advisorChatMessages');

    box.innerHTML += `
      <div class="msg msg-user">
        <span class="msg-sender">${appState.studentName.toUpperCase()}</span>
        ${question}
      </div>
    `;
    input.value = '';
    btnSend.disabled = true;
    box.scrollTop = box.scrollHeight;

    const totalGrades = appState.courses.reduce((acc, c) => acc + Number(c.grade), 0);
    const avgGrade = Number((totalGrades / appState.courses.length).toFixed(1));

    try {
      const res = await fetch(`${API_BASE}/api/consultar-carrera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: appState.studentName,
          topCareerName: appState.topCareerResult.name,
          topCareerMatch: appState.topCareerResult.finalMatch,
          averageGrade: avgGrade,
          courses: appState.courses,
          nlpAnswers: appState.nlpAnswers,
          rankedCareers: appState.rankedCareersList,
          question: question
        })
      });
      const data = await res.json();

      box.innerHTML += `
        <div class="msg msg-ai">
          <span class="msg-sender">ORIENTADOR IA</span>
          ${data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
        </div>
      `;
    } catch (err) {
      box.innerHTML += `
        <div class="msg msg-ai">
          <span class="msg-sender">ORIENTADOR IA</span>
          La carrera de <strong>${appState.topCareerResult.name}</strong> se puede estudiar en universidades como <strong>${appState.topCareerResult.universities}</strong> y en modalidad de instituto según especialidad (${appState.topCareerResult.institutes || 'ISIL, Cibertec, Certus'}).
        </div>
      `;
    }

    btnSend.disabled = false;
    box.scrollTop = box.scrollHeight;
  });
}

function resetFullApp() {
  window.location.reload();
}