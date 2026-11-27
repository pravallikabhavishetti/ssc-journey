// ========================================
// SSC JOURNEY - COMPLETE SCRIPT
// ========================================

const subjects = ["quant", "reasoning", "english", "gk"];

const subjectNames = {
    quant: "Quantitative Aptitude",
    reasoning: "Reasoning",
    english: "English",
    gk: "General Awareness"
};

let tasks = JSON.parse(localStorage.getItem("sscTasks") || "{}");
let syllabus = JSON.parse(localStorage.getItem("sscSyllabus") || "{}");
let studyPlans = JSON.parse(localStorage.getItem("sscStudyPlans") || "{}");
let activityDates = JSON.parse(localStorage.getItem("sscActivityDates") || "[]");
let revisionList = JSON.parse(localStorage.getItem("sscRevisionList") || "[]");
let pendingTopics = {};

// ========================================
// DATE
// ========================================

function getToday() {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateOffset(dateString, offset) {
    const d = new Date(dateString + "T12:00:00");

    d.setDate(d.getDate() + offset);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function displayDate() {
    const dateEl = document.getElementById("date");
    const planDateEl = document.getElementById("planDate");

    const d = new Date();

    if (dateEl) {
        dateEl.textContent = d.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    if (planDateEl) {
        planDateEl.textContent = "Plan for " + d.toLocaleDateString("en-IN");
    }
}

// ========================================
// NAVIGATION
// ========================================

function showSection(sectionId, button) {

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const target = document.getElementById(sectionId);

    if (target) {
        target.classList.add("active");
    }

    if (button) {
        button.classList.add("active");
    }
}

// ========================================
// MOTIVATION
// ========================================

const quotes = [
    "Small steps every day lead to big results. ✨",
    "Consistency matters more than perfection. 🌷",
    "Your future is built by what you do today. 💜",
    "You can learn anything with patience. 🌱",
    "One topic at a time. One day at a time. 🌸",
    "Keep learning. Keep growing. ✨",
    "Your effort today is your strength tomorrow. 💫"
];

function displayMotivation() {

    const el = document.getElementById("motivation");

    if (el) {
        el.textContent = quotes[new Date().getDate() % quotes.length];
    }
}

// ========================================
// ACTIVITY TRACKING
// ========================================

function recordActivity() {

    const today = getToday();

    if (!activityDates.includes(today)) {
        activityDates.push(today);
    }

    activityDates = [...new Set(activityDates)].sort();

    localStorage.setItem(
        "sscActivityDates",
        JSON.stringify(activityDates)
    );

    renderStreak();
    renderHistory();
}

// ========================================
// TASKS
// ========================================

function getTodayTasks() {

    const today = getToday();

    if (!tasks[today]) {
        tasks[today] = [];
    }

    return tasks[today];
}

function saveTasks() {
    localStorage.setItem("sscTasks", JSON.stringify(tasks));
}

function addTask() {

    const input = document.getElementById("taskInput");

    if (!input) return;

    const text = input.value.trim();

    if (!text) {
        alert("Please enter a task.");
        return;
    }

    getTodayTasks().push({
        text: text,
        completed: false
    });

    saveTasks();

    input.value = "";

    renderTasks();
    updateProgress();
}

function toggleTask(index) {

    const list = getTodayTasks();

    if (!list[index]) return;

    list[index].completed = !list[index].completed;

    saveTasks();

    if (list[index].completed) {
        recordActivity();
    }

    renderTasks();
    updateProgress();
}

function deleteTask(index) {

    getTodayTasks().splice(index, 1);

    saveTasks();

    renderTasks();
    updateProgress();
}

function renderTasks() {

    const container = document.getElementById("task-list");

    if (!container) return;

    container.innerHTML = "";

    getTodayTasks().forEach((task, index) => {

        const div = document.createElement("div");

        div.className = "task-item";

        if (task.completed) {
            div.classList.add("completed");
        }

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.onchange = () => toggleTask(index);

        const label = document.createElement("label");

        label.textContent = task.text;

        const del = document.createElement("button");

        del.textContent = "Delete";
        del.className = "delete-btn";
        del.onclick = () => deleteTask(index);

        div.append(checkbox, label, del);

        container.appendChild(div);
    });
}

// ========================================
// PROGRESS
// ========================================

function updateProgress() {

    const list = getTodayTasks();

    const total = list.length;

    const completed = list.filter(t => t.completed).length;

    const percent = total
        ? Math.round(completed / total * 100)
        : 0;

    const text = document.getElementById("progress");

    const fill = document.getElementById("progressFill");

    const counter = document.getElementById("taskCounter");

    if (text) {
        text.textContent = percent + "%";
    }

    if (fill) {
        fill.style.width = percent + "%";
    }

    if (counter) {
        counter.textContent = `${completed} of ${total} tasks completed`;
    }
}

// ========================================
// OCR SYLLABUS
// ========================================

async function readSyllabus(subject) {

    const fileInput = document.getElementById(subject + "File");

    const status = document.getElementById(subject + "Status");

    const preview = document.getElementById(subject + "Preview");

    const saveButton = document.getElementById(subject + "SaveBtn");

    if (!fileInput || !status || !preview || !saveButton) return;

    if (!fileInput.files || !fileInput.files.length) {
        alert("Please upload a syllabus image first.");
        return;
    }

    if (typeof Tesseract === "undefined") {
        status.textContent = "OCR library unavailable. Check your internet connection.";
        return;
    }

    status.textContent = "Reading image...";

    preview.innerHTML = "";

    saveButton.hidden = true;

    try {

        const result = await Tesseract.recognize(
            fileInput.files[0],
            "eng",
            {
                logger: message => {

                    if (message.status === "recognizing text") {

                        status.textContent =
                            "Reading image... " +
                            Math.round(message.progress * 100) +
                            "%";
                    }
                }
            }
        );

        let lines = result.data.text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 1);

        lines = lines.map(line =>
            line.replace(/^[\s\d.)\-:]+/, "").trim()
        ).filter(line => line.length > 1);

        pendingTopics[subject] = [...new Set(lines)];

        if (!pendingTopics[subject].length) {

            status.textContent = "No topics detected. Try a clearer image.";

            return;
        }

        renderPreview(subject);

        status.textContent = "Review the topics below before saving.";

        saveButton.hidden = false;

    } catch (error) {

        console.error(error);

        status.textContent = "OCR failed. Please try another image.";
    }
}

// ========================================
// OCR PREVIEW
// ========================================

function renderPreview(subject) {

    const container = document.getElementById(subject + "Preview");

    if (!container) return;

    container.innerHTML = "";

    (pendingTopics[subject] || []).forEach((topic, index) => {

        const div = document.createElement("div");

        div.className = "topic-item";

        const label = document.createElement("label");

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.dataset.index = index;

        const span = document.createElement("span");

        span.textContent = topic;

        label.append(checkbox, span);

        div.appendChild(label);

        container.appendChild(div);
    });
}

// ========================================
// SAVE SYLLABUS
// ========================================

function saveSyllabus(subject) {

    const preview = document.getElementById(subject + "Preview");

    if (!preview || !pendingTopics[subject]) return;

    const boxes = preview.querySelectorAll('input[type="checkbox"]');

    const selected = [];

    boxes.forEach(box => {

        if (box.checked) {

            selected.push(
                pendingTopics[subject][Number(box.dataset.index)]
            );
        }
    });

    if (!selected.length) {
        alert("Please select at least one topic.");
        return;
    }

    const old = syllabus[subject] || [];

    syllabus[subject] = selected.map(text => {

        const existing = old.find(t => t.text === text);

        return existing
            ? existing
            : {
                text: text,
                completed: false
            };
    });

    localStorage.setItem(
        "sscSyllabus",
        JSON.stringify(syllabus)
    );

    renderSyllabus(subject);
    renderSubjectProgress();

    const status = document.getElementById(subject + "Status");

    if (status) {
        status.textContent = "Syllabus saved successfully!";
    }

    const saveButton = document.getElementById(subject + "SaveBtn");

    if (saveButton) {
        saveButton.hidden = true;
    }
}
// ========================================
// MANUAL SYLLABUS ENTRY
// ========================================

function saveManualSyllabus(subject) {

    const input = document.getElementById(subject + "ManualInput");

    if (!input) {
        alert("Manual syllabus input not found.");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        alert("Please enter your syllabus first.");
        return;
    }

    const topics = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^[\s\d.)\-•]+/, "").trim())
        .filter(line => line.length > 0);

    const uniqueTopics = [...new Set(topics)];

    const oldTopics = syllabus[subject] || [];

    syllabus[subject] = uniqueTopics.map(text => {

        const existing = oldTopics.find(topic => topic.text === text);

        return existing
            ? existing
            : {
                text: text,
                completed: false
            };
    });

    localStorage.setItem(
        "sscSyllabus",
        JSON.stringify(syllabus)
    );

    renderSyllabus(subject);
    renderSubjectProgress();

    input.value = "";

    const status = document.getElementById(subject + "Status");

    if (status) {
        status.textContent = "Manual syllabus saved successfully!";
    }

    alert("Manual syllabus saved successfully!");
}

// ========================================
// DISPLAY SAVED TOPICS
// ========================================

function renderSyllabus(subject) {

    const container = document.getElementById(subject + "List");

    if (!container) return;

    container.innerHTML = "";

    (syllabus[subject] || []).forEach((topic, index) => {

        const div = document.createElement("div");

        div.className = "topic-item";

        if (topic.completed) {
            div.classList.add("completed");
        }

        const row = document.createElement("div");

        row.className = "topic-row";

        const label = document.createElement("label");

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = !!topic.completed;

        checkbox.onchange = () => toggleTopic(subject, index);

        const span = document.createElement("span");

        span.className = "topic-text";
        span.textContent = topic.text;

        label.append(checkbox, span);

        const actions = document.createElement("div");

        actions.className = "topic-actions";

        const up = document.createElement("button");

        up.textContent = "↑";
        up.title = "Move up";
        up.disabled = index === 0;

        up.onclick = () => moveTopic(subject, index, -1);

        const down = document.createElement("button");

        down.textContent = "↓";
        down.title = "Move down";
        down.disabled = index === (syllabus[subject] || []).length - 1;

        down.onclick = () => moveTopic(subject, index, 1);

        actions.append(up, down);

        row.append(label, actions);

        div.appendChild(row);

        container.appendChild(div);
    });
}

// ========================================
// TOPIC COMPLETION
// ========================================

function toggleTopic(subject, index) {

    const topic = syllabus[subject]?.[index];

    if (!topic) return;

    topic.completed = !topic.completed;

    if (topic.completed) {

        recordActivity();

        addRevisionSchedule(subject, topic.text);

    } else {

        revisionList = revisionList.filter(item =>
            !(item.subject === subject && item.topic === topic.text)
        );

        localStorage.setItem(
            "sscRevisionList",
            JSON.stringify(revisionList)
        );
    }

    localStorage.setItem(
        "sscSyllabus",
        JSON.stringify(syllabus)
    );

    renderSyllabus(subject);
    renderSubjectProgress();
    renderRevision();
}

// ========================================
// TOPIC ORDER
// ========================================

function moveTopic(subject, index, direction) {

    const list = syllabus[subject] || [];

    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= list.length) return;

    [list[index], list[newIndex]] = [list[newIndex], list[index]];

    localStorage.setItem(
        "sscSyllabus",
        JSON.stringify(syllabus)
    );

    renderSyllabus(subject);
}

// ========================================
// DAILY STUDY PLAN
// ========================================

function generatePlan() {

    const today = getToday();

    const plan = [];

    subjects.forEach(subject => {

        const list = syllabus[subject] || [];

        const next = list.find(topic => !topic.completed);

        if (next) {

            plan.push({
                subject: subject,
                topic: next.text
            });
        }
    });

    const container = document.getElementById("todayPlan");

    if (!plan.length) {

        if (container) {
            container.innerHTML =
                "<p>No pending topics found. Upload your syllabuses or complete your current topics.</p>";
        }

        return;
    }

    studyPlans[today] = plan;

    localStorage.setItem(
        "sscStudyPlans",
        JSON.stringify(studyPlans)
    );

    renderPlan(plan);
}

// ========================================
// DISPLAY PLAN
// ========================================

function renderPlan(plan) {

    const container = document.getElementById("todayPlan");

    if (!container) return;

    container.innerHTML = "";

    (plan || []).forEach((item, index) => {

        const div = document.createElement("div");

        div.className = "plan-item";

        const heading = document.createElement("div");

        heading.className = "plan-subject";

        heading.textContent =
            "SESSION " + (index + 1) +
            " · " + (subjectNames[item.subject] || item.subject).toUpperCase();

        const topicLabel = document.createElement("div");

        topicLabel.className = "plan-topic";

        topicLabel.textContent = item.topic;

        const btn = document.createElement("button");

        btn.textContent = "Mark Topic Complete";

        btn.onclick = () => {

            const i = (syllabus[item.subject] || []).findIndex(
                t => t.text === item.topic && !t.completed
            );

            if (i !== -1) {

                syllabus[item.subject][i].completed = true;

                localStorage.setItem(
                    "sscSyllabus",
                    JSON.stringify(syllabus)
                );

                recordActivity();

                addRevisionSchedule(item.subject, item.topic);

                renderSyllabus(item.subject);
                renderSubjectProgress();
                renderRevision();

                generatePlan();
            }
        };

        div.append(heading, topicLabel, btn);

        container.appendChild(div);
    });
}

// ========================================
// LOAD TODAY'S PLAN
// ========================================

function loadTodayPlan() {

    const today = getToday();

    const container = document.getElementById("todayPlan");

    if (studyPlans[today]) {

        renderPlan(studyPlans[today]);

    } else if (container) {

        container.innerHTML = "";
    }
}

// ========================================
// DASHBOARD EXTRA FEATURES
// ========================================

function createDashboardFeatures() {

    if (document.getElementById("sscExtraFeatures")) return;

    const dashboard = document.getElementById("dashboard");

    if (!dashboard) {
        console.warn("Dashboard section not found; extra panels not created.");
        return;
    }

    const wrapper = document.createElement("div");

    wrapper.id = "sscExtraFeatures";

    wrapper.innerHTML = `
        <section class="card" id="subjectProgressCard">
            <h2>📊 Subject Progress</h2>
            <div id="subjectProgress"></div>
        </section>

        <section class="card" id="revisionCard">
            <h2>🔁 Revision Tracker</h2>
            <div id="revisionContent"></div>
        </section>

        <section class="card" id="streakCard">
            <h2>🔥 Study Streak</h2>
            <div id="streakContent"></div>
        </section>

        <section class="card" id="historyCard">
            <h2>📅 Study History (14 days)</h2>
            <div id="historyContent"></div>
        </section>

        <section class="card" id="reminderCard">
            <h2>⏰ Daily Reminder</h2>
            <div id="reminderContent"></div>
        </section>
    `;

    dashboard.appendChild(wrapper);
}

// ========================================
// SUBJECT PROGRESS
// ========================================

function renderSubjectProgress() {

    const container = document.getElementById("subjectProgress");

    if (!container) return;

    container.innerHTML = "";

    subjects.forEach(subject => {

        const list = syllabus[subject] || [];

        const completed = list.filter(t => t.completed).length;

        const percent = list.length
            ? Math.round(completed / list.length * 100)
            : 0;

        const row = document.createElement("div");

        row.className = "subject-progress-row";
        row.style.marginBottom = "14px";

        const title = document.createElement("div");

        title.textContent =
            `${subjectNames[subject]} · ${completed}/${list.length} (${percent}%)`;

        title.style.marginBottom = "6px";

        const track = document.createElement("div");

        track.className = "progress-container";
        track.style.height = "10px";

        const fill = document.createElement("div");

        fill.className = "progress-fill";
        fill.style.width = percent + "%";
        fill.style.height = "100%";

        track.appendChild(fill);

        row.append(title, track);

        container.appendChild(row);
    });
}

// ========================================
// REVISION SYSTEM
// ========================================

function addRevisionSchedule(subject, topic) {

    revisionList = revisionList.filter(item =>
        !(item.subject === subject && item.topic === topic)
    );

    const completedOn = getToday();

    [1, 3, 7].forEach(days => {

        revisionList.push({
            subject: subject,
            topic: topic,
            dueDate: dateOffset(completedOn, days),
            interval: days,
            revised: false
        });
    });

    localStorage.setItem(
        "sscRevisionList",
        JSON.stringify(revisionList)
    );
}

function renderRevision() {

    const container = document.getElementById("revisionContent");

    if (!container) return;

    container.innerHTML = "";

    const today = getToday();

    const due = revisionList.filter(item =>
        item.dueDate <= today && !item.revised
    );

    if (!due.length) {

        container.innerHTML =
            "<p>No revisions due today. Your scheduled revisions will appear here.</p>";

        return;
    }

    due.forEach(item => {

        const row = document.createElement("div");

        row.className = "topic-item";

        const text = document.createElement("span");

        text.textContent =
            `${subjectNames[item.subject]}: ${item.topic} · Due ${item.dueDate}`;

        const btn = document.createElement("button");

        btn.textContent = "Mark Revised";

        btn.onclick = () => {

            const original = revisionList.indexOf(item);

            if (original !== -1) {
                revisionList.splice(original, 1);
            }

            localStorage.setItem(
                "sscRevisionList",
                JSON.stringify(revisionList)
            );

            renderRevision();

            recordActivity();
        };

        row.append(text, btn);

        container.appendChild(row);
    });
}

// ========================================
// STREAK
// ========================================

function renderStreak() {

    const container = document.getElementById("streakContent");

    if (!container) return;

    const sorted = [...new Set(activityDates)].sort();

    let streak = 0;

    let check = getToday();

    if (!sorted.includes(check)) {
        check = dateOffset(check, -1);
    }

    while (sorted.includes(check)) {

        streak++;

        check = dateOffset(check, -1);
    }

    container.innerHTML = `
        <p style="font-size:1.2em">
            🔥 <strong>${streak} day${streak === 1 ? "" : "s"}</strong>
        </p>

        <p>
            ${activityDates.includes(getToday())
                ? "Today's study activity recorded!"
                : "Complete a task or topic today to record activity."}
        </p>
    `;
}

// ========================================
// STUDY HISTORY
// ========================================

function renderHistory() {

    const container = document.getElementById("historyContent");

    if (!container) return;

    container.innerHTML = "";

    const today = getToday();

    for (let i = 13; i >= 0; i--) {

        const day = dateOffset(today, -i);

        const active = activityDates.includes(day);

        const row = document.createElement("div");

        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.padding = "6px 0";

        const label = document.createElement("span");

        label.textContent = new Date(day + "T12:00:00")
            .toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short"
            });

        const mark = document.createElement("span");

        mark.textContent = active ? "✓ Studied" : "—";

        mark.style.fontWeight = "bold";

        row.append(label, mark);

        container.appendChild(row);
    }
}

// ========================================
// DAILY REMINDER
// ========================================

function createReminderUI() {

    const container = document.getElementById("reminderContent");

    if (!container) return;

    container.innerHTML = "";

    const label = document.createElement("label");

    label.textContent = "Reminder time: ";

    const input = document.createElement("input");

    input.type = "time";
    input.id = "sscReminderTime";
    input.value = localStorage.getItem("sscReminderTime") || "19:00";

    const btn = document.createElement("button");

    btn.textContent = "Save Reminder";

    const status = document.createElement("p");

    status.id = "reminderStatus";

    status.textContent =
        "Reminder checks while this website is open.";

    btn.onclick = async () => {

        localStorage.setItem("sscReminderTime", input.value);

        if (
            "Notification" in window &&
            Notification.permission === "default"
        ) {
            await Notification.requestPermission();
        }

        status.textContent =
            "Reminder saved for " + input.value +
            ". Keep the website open for notification checks.";
    };

    label.appendChild(input);

    container.append(label, btn, status);
}

function checkReminder() {

    const time = localStorage.getItem("sscReminderTime");

    if (
        !time ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    const now = new Date();

    const current =
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}`;

    const key = "sscReminderSent";

    if (
        current === time &&
        localStorage.getItem(key) !== getToday()
    ) {

        new Notification("SSC Journey", {
            body: "Time for your SSC study session. Start with one topic today!"
        });

        localStorage.setItem(key, getToday());
    }
}

// ========================================
// INITIALIZE
// ========================================

function initializeWebsite() {

    displayDate();

    displayMotivation();

    createDashboardFeatures();

    renderTasks();

    updateProgress();

    loadTodayPlan();

    subjects.forEach(subject => {
        renderSyllabus(subject);
    });

    renderSubjectProgress();

    renderRevision();

    renderStreak();

    renderHistory();

    createReminderUI();

    setInterval(checkReminder, 60000);
}

initializeWebsite();
