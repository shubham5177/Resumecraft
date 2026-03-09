// Preview page logic
import { onAuthChange } from './auth.js';
import { getResume } from './database.js';

const params = new URLSearchParams(window.location.search);
const resumeId = params.get('id');
const editBtn = document.getElementById("editBtn");
const resumeContent = document.getElementById("resumeContent");
const loading = document.getElementById("loadingPlaceholder");

console.log('Preview page loaded, resumeId:', resumeId);

if (editBtn && resumeId) {
    editBtn.href = "builder.html?id=" + resumeId;
} else if (editBtn) {
    editBtn.href = "builder.html";
}

onAuthChange(async(user) => {
    if (!user) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = "login.html";
        return;
    }

    console.log('User authenticated:', user.email);

    if (!resumeId) {
        console.log('No resume ID, redirecting to dashboard');
        window.location.href = "dashboard.html";
        return;
    }

    try {
        console.log('Loading resume:', resumeId);
        const data = await getResume(resumeId);

        if (!data) {
            console.error('Resume not found');
            alert('Resume not found');
            window.location.href = "dashboard.html";
            return;
        }

        console.log('Resume data received:', Object.keys(data));

        // Normalize data to handle Firestore timestamps and missing fields
        const cleanData = normalizeResumeData(data);
        console.log('Data normalized, rendering...');

        renderResume(cleanData);
    } catch (error) {
        console.error('Error loading resume:', error);
        alert('Error loading resume: ' + (error.message || error));
        window.location.href = "dashboard.html";
    }
});

// Normalize resume data from Firestore
function normalizeResumeData(data) {
    try {
        const cleaned = JSON.parse(JSON.stringify(data));
        cleaned.personal = cleaned.personal || {};
        cleaned.education = Array.isArray(cleaned.education) ? cleaned.education : [];
        cleaned.skills = Array.isArray(cleaned.skills) ? cleaned.skills : [];
        cleaned.projects = Array.isArray(cleaned.projects) ? cleaned.projects : [];
        cleaned.certifications = Array.isArray(cleaned.certifications) ? cleaned.certifications : [];
        cleaned.template = cleaned.template || 'template1';
        return cleaned;
    } catch (e) {
        console.error('Error normalizing data:', e);
        return data;
    }
}

function renderResume(data) {
    try {
        console.log('Rendering resume with template:', data.template);
        const template = data.template || "template1";
        let html = "";
        if (template === "template2") {
            html = renderTemplate2(data);
        } else if (template === "template3") {
            html = renderTemplate3(data);
        } else {
            html = renderTemplate1(data);
        }
        resumeContent.innerHTML = html;
        if (loading) loading.remove();
        console.log('Resume rendered successfully');
    } catch (error) {
        console.error('Error rendering resume:', error);
        resumeContent.innerHTML = '<div style="padding:2rem;text-align:center">Error rendering resume: ' + (error.message || error) + '</div>';
        if (loading) loading.remove();
    }
}

function renderTemplate1(data) {
    const p = data.personal || {};
    var html = '<div style="font-family:Inter,sans-serif;color:#1a1a2e;background:#fff;padding:40px">';
    html += '<div style="border-bottom:3px solid #6C63FF;padding-bottom:20px;margin-bottom:20px;display:flex;gap:20px">';
    if (p.photo) {
        html += '<img src="' + p.photo + '" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #6C63FF">';
    }
    html += '<div>';
    html += '<div style="font-size:28px;font-weight:800">' + (p.name || "Your Name") + '</div>';
    html += '<div style="font-size:14px;color:#666;margin-top:5px">';
    if (p.email) html += '✉ ' + p.email + ' ';
    if (p.phone) html += '| 📞 ' + p.phone;
    if (p.address) html += '| 📍 ' + p.address;
    if (p.linkedin) html += '| 🔗 ' + p.linkedin;
    if (p.github) html += '| 💻 ' + p.github;
    html += '</div></div></div>';
    if (p.summary) {
        html += '<div style="margin-bottom:20px"><h3 style="color:#6C63FF">Professional Summary</h3><p>' + p.summary + '</p></div>';
    }
    html += renderEdu(data);
    html += renderSkills(data);
    html += renderProjects(data);
    html += renderCerts(data);
    html += '</div>';
    return html;
}

function renderTemplate2(data) {
    const p = data.personal || {};
    var html = '<div style="font-family:Georgia,serif;background:#fff">';
    html += '<div style="background:#6C63FF;color:white;padding:40px">';
    html += '<h1>' + (p.name || "Your Name") + '</h1>';
    html += '<p>' + (p.email || "");
    if (p.phone) html += " | " + p.phone;
    if (p.address) html += " | " + p.address;
    html += '</p></div><div style="padding:40px">';
    if (p.summary) html += '<p style="font-style:italic">' + p.summary + '</p>';
    html += renderEdu(data);
    html += renderSkills(data);
    html += renderProjects(data);
    html += renderCerts(data);
    html += '</div></div>';
    return html;
}

function renderTemplate3(data) {
    const p = data.personal || {};
    var html = '<div style="font-family:Arial;background:#0f2027;color:white;padding:40px">';
    html += '<h1>' + (p.name || "Your Name") + '</h1>';
    html += '<p>' + (p.email || "");
    if (p.phone) html += " | " + p.phone;
    if (p.linkedin) html += " | " + p.linkedin;
    html += '</p>';
    if (p.summary) html += '<p>' + p.summary + '</p>';
    html += renderEdu(data);
    html += renderSkills(data);
    html += renderProjects(data);
    html += renderCerts(data);
    html += '</div>';
    return html;
}

function renderEdu(data) {
    var items = (data.education || []).filter(function(e) { return e.degree || e.college; });
    if (!items.length) return "";
    var html = '<div style="margin-top:20px"><h3>Education</h3>';
    items.forEach(function(e) {
        html += '<div><strong>' + (e.degree || "") + '</strong>';
        html += '<div>' + (e.college || "");
        if (e.start) html += " | " + e.start;
        if (e.end) html += " - " + e.end;
        html += '</div></div>';
    });
    html += '</div>';
    return html;
}

function renderSkills(data) {
    if (!data.skills || !data.skills.length) return "";
    return '<div style="margin-top:20px"><h3>Skills</h3><p>' + data.skills.join(", ") + '</p></div>';
}

function renderProjects(data) {
    var items = (data.projects || []).filter(function(p) { return p.title || p.desc; });
    if (!items.length) return "";
    var html = '<div style="margin-top:20px"><h3>Projects</h3>';
    items.forEach(function(p) {
        html += '<div><strong>' + (p.title || "") + '</strong><p>' + (p.desc || "") + '</p></div>';
    });
    html += '</div>';
    return html;
}

function renderCerts(data) {
    var items = (data.certifications || []).filter(function(c) { return c.name; });
    if (!items.length) return "";
    var html = '<div style="margin-top:20px"><h3>Certifications</h3>';
    items.forEach(function(c) {
        html += '<div>🏆 ' + c.name;
        if (c.org) html += " - " + c.org;
        if (c.date) html += " (" + c.date + ")";
        html += '</div>';
    });
    html += '</div>';
    return html;
}

window.downloadPDF = function() {
    var element = document.getElementById("resumeContent");
    var btn = document.getElementById("downloadBtn");
    btn.innerHTML = "Generating...";
    btn.disabled = true;
    var opt = {
        margin: 0,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save().then(function() {
        btn.innerHTML = '<i class="bi bi-download me-1"></i>Download PDF';
        btn.disabled = false;
    });
};