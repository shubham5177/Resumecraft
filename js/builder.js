// Builder form logic: dynamic fields, live preview, photo upload

var skills = [];
var educationCount = 1;
var projectCount = 1;
var certCount = 1;
var currentTemplate = localStorage.getItem('selectedTemplate') || 'template1';
var photoDataURL = null;
var currentResumeId = new URLSearchParams(window.location.search).get('id');
var saveDebounceTimer;

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { saveResume, getResume } from './database.js';
import { storage } from './firebase-config.js';
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";

// Current user
var currentUser = null;
onAuthStateChanged(auth, function(user) {
    if (!user) { window.location.href = 'login.html'; return; }
    currentUser = user;
    console.log('User authenticated:', user.email);
    if (currentResumeId) {
        loadExistingResume();
    } else {
        updatePreview();
    }
});

// Section switching
window.switchSection = function(section) {
    document.querySelectorAll('.section-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.form-section').forEach(function(s) { s.classList.remove('active'); });
    var sectionEl = document.querySelector('[data-section="' + section + '"]');
    if (sectionEl) sectionEl.classList.add('active');
    var sectionId = document.getElementById('section-' + section);
    if (sectionId) sectionId.classList.add('active');
};

// Photo upload
window.initPhotoUpload = function() {
    var inp = document.getElementById('photoInput');
    var preview = document.getElementById('photoPreview');
    var area = document.getElementById('photoUploadArea');

    area.addEventListener('click', function() { inp.click(); });
    area.addEventListener('dragover', function(e) {
        e.preventDefault();
        area.style.borderColor = 'var(--accent)';
    });
    area.addEventListener('dragleave', function() { area.style.borderColor = ''; });
    area.addEventListener('drop', function(e) {
        e.preventDefault();
        area.style.borderColor = '';
        if (e.dataTransfer.files[0]) handlePhoto(e.dataTransfer.files[0]);
    });
    inp.addEventListener('change', function() { if (inp.files[0]) handlePhoto(inp.files[0]); });

    function handlePhoto(file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            photoDataURL = e.target.result;
            preview.src = photoDataURL;
            preview.style.display = 'block';
            area.querySelector('p').textContent = 'Click to change photo';
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
};

// Skill management
window.addSkill = function() {
    var inp = document.getElementById('skillInput');
    var val = inp.value.trim();
    if (!val || skills.includes(val)) { inp.value = ''; return; }
    skills.push(val);
    inp.value = '';
    renderSkills();
    updatePreview();
};

window.removeSkill = function(i) {
    skills.splice(i, 1);
    renderSkills();
    updatePreview();
};

function renderSkills() {
    var container = document.getElementById('skillTags');
    container.innerHTML = skills.map(function(s, i) {
        return '<span class="skill-tag">' + s + '<button onclick="removeSkill(' + i + ')" title="Remove">×</button></span>';
    }).join('');
}

// Add/remove dynamic entries
window.addEducation = function() {
    educationCount++;
    var container = document.getElementById('educationList');
    var div = document.createElement('div');
    div.className = 'section-card mb-3';
    div.id = 'edu-' + educationCount;
    div.innerHTML = '<div class="section-card-header"><span class="section-card-title">Education ' + educationCount + '</span><button class="btn-remove" onclick="removeItem(\'edu-' + educationCount + '\')"><i class="bi bi-trash"></i></button></div>' +
        '<div class="form-group"><label class="form-label">Degree / Qualification</label><input type="text" class="form-control preview-trigger" placeholder="B.Tech Computer Science" data-field="edu-degree-' + educationCount + '"></div>' +
        '<div class="form-group"><label class="form-label">College / University</label><input type="text" class="form-control preview-trigger" placeholder="MIT" data-field="edu-college-' + educationCount + '"></div>' +
        '<div class="row"><div class="col"><div class="form-group"><label class="form-label">Start Year</label><input type="text" class="form-control preview-trigger" placeholder="2020" data-field="edu-start-' + educationCount + '"></div></div><div class="col"><div class="form-group"><label class="form-label">End Year</label><input type="text" class="form-control preview-trigger" placeholder="2024" data-field="edu-end-' + educationCount + '"></div></div></div>' +
        '<div class="form-group"><label class="form-label">GPA / Percentage (optional)</label><input type="text" class="form-control preview-trigger" placeholder="3.8 GPA / 85%" data-field="edu-gpa-' + educationCount + '"></div>';
    container.appendChild(div);
    attachPreviewTriggers(div);
};

window.addProject = function() {
    projectCount++;
    var container = document.getElementById('projectList');
    var div = document.createElement('div');
    div.className = 'section-card mb-3';
    div.id = 'proj-' + projectCount;
    div.innerHTML = '<div class="section-card-header"><span class="section-card-title">Project / Experience ' + projectCount + '</span><button class="btn-remove" onclick="removeItem(\'proj-' + projectCount + '\')"><i class="bi bi-trash"></i></button></div>' +
        '<div class="form-group"><label class="form-label">Title / Position</label><input type="text" class="form-control preview-trigger" placeholder="Full Stack Developer" data-field="proj-title-' + projectCount + '"></div>' +
        '<div class="form-group"><label class="form-label">Company / Project Name</label><input type="text" class="form-control preview-trigger" placeholder="My Awesome App" data-field="proj-company-' + projectCount + '"></div>' +
        '<div class="row"><div class="col"><div class="form-group"><label class="form-label">Start Date</label><input type="text" class="form-control preview-trigger" placeholder="Jan 2023" data-field="proj-start-' + projectCount + '"></div></div><div class="col"><div class="form-group"><label class="form-label">End Date</label><input type="text" class="form-control preview-trigger" placeholder="Present" data-field="proj-end-' + projectCount + '"></div></div></div>' +
        '<div class="form-group"><label class="form-label">Description</label><textarea class="form-control preview-trigger" rows="3" placeholder="Describe responsibilities and achievements..." data-field="proj-desc-' + projectCount + '"></textarea></div>' +
        '<div class="form-group"><label class="form-label">Technologies Used</label><input type="text" class="form-control preview-trigger" placeholder="React, Node.js, MongoDB" data-field="proj-tech-' + projectCount + '"></div>';
    container.appendChild(div);
    attachPreviewTriggers(div);
};

window.addCertification = function() {
    certCount++;
    var container = document.getElementById('certList');
    var div = document.createElement('div');
    div.className = 'section-card mb-3';
    div.id = 'cert-' + certCount;
    div.innerHTML = '<div class="section-card-header"><span class="section-card-title">Certification ' + certCount + '</span><button class="btn-remove" onclick="removeItem(\'cert-' + certCount + '\')"><i class="bi bi-trash"></i></button></div>' +
        '<div class="form-group"><label class="form-label">Certification Name</label><input type="text" class="form-control preview-trigger" placeholder="AWS Solutions Architect" data-field="cert-name-' + certCount + '"></div>' +
        '<div class="form-group"><label class="form-label">Issuing Organization</label><input type="text" class="form-control preview-trigger" placeholder="Amazon Web Services" data-field="cert-org-' + certCount + '"></div>' +
        '<div class="form-group"><label class="form-label">Date</label><input type="text" class="form-control preview-trigger" placeholder="December 2023" data-field="cert-date-' + certCount + '"></div>';
    container.appendChild(div);
    attachPreviewTriggers(div);
};

window.removeItem = function(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
    updatePreview();
};

// Attach event listeners to preview-trigger inputs
function attachPreviewTriggers(container) {
    container.querySelectorAll('.preview-trigger').forEach(function(el) {
        el.addEventListener('input', function() {
            scheduleSave();
            updatePreview();
        });
    });
}

// Collect all form data
function collectFormData() {
    function get(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function getField(field) {
        var el = document.querySelector('[data-field="' + field + '"]');
        return el ? el.value.trim() : '';
    }

    var education = [];
    for (var i = 1; i <= educationCount; i++) {
        var eduEl = document.getElementById('edu-' + i);
        if (!eduEl) continue;
        education.push({
            degree: getField('edu-degree-' + i),
            college: getField('edu-college-' + i),
            start: getField('edu-start-' + i),
            end: getField('edu-end-' + i),
            gpa: getField('edu-gpa-' + i)
        });
    }

    var projects = [];
    for (var j = 1; j <= projectCount; j++) {
        var projEl = document.getElementById('proj-' + j);
        if (!projEl) continue;
        projects.push({
            title: getField('proj-title-' + j),
            company: getField('proj-company-' + j),
            start: getField('proj-start-' + j),
            end: getField('proj-end-' + j),
            desc: getField('proj-desc-' + j),
            tech: getField('proj-tech-' + j)
        });
    }

    var certifications = [];
    for (var k = 1; k <= certCount; k++) {
        var certEl = document.getElementById('cert-' + k);
        if (!certEl) continue;
        certifications.push({
            name: getField('cert-name-' + k),
            org: getField('cert-org-' + k),
            date: getField('cert-date-' + k)
        });
    }

    return {
        title: get('resumeTitle') || 'My Resume',
        template: currentTemplate,
        personal: {
            name: get('personalName'),
            email: get('personalEmail'),
            phone: get('personalPhone'),
            address: get('personalAddress'),
            linkedin: get('personalLinkedin'),
            github: get('personalGithub'),
            summary: get('personalSummary'),
            photo: photoDataURL || ''
        },
        education: education,
        skills: skills,
        projects: projects,
        certifications: certifications
    };
}

// Live preview
window.updatePreview = function() {
    try {
        var data = collectFormData();
        var previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) {
            console.warn('Preview frame not found');
            return;
        }

        // Always use inline preview for reliability
        previewFrame.srcdoc = buildInlinePreview(data);
    } catch (error) {
        console.error('Error updating preview:', error);
    }
}

function buildInlinePreview(data) {
    var p = data.personal;
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');* { margin:0; padding:0; box-sizing:border-box; }body { font-family:\'Inter\',sans-serif; color:#1a1a2e; background:#fff; padding:2.5rem; font-size:0.88rem; line-height:1.5; }.header { border-bottom:3px solid #6C63FF; padding-bottom:1.2rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:1.5rem; }.photo { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid #6C63FF; flex-shrink:0; }.name { font-size:1.6rem; font-weight:700; color:#1a1a2e; }.contact { font-size:0.78rem; color:#666; display:flex; flex-wrap:wrap; gap:0.5rem 1.2rem; margin-top:0.4rem; }.contact span { display:flex; align-items:center; gap:0.25rem; }.section { margin-bottom:1.4rem; }.section-title { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#6C63FF; margin-bottom:0.6rem; }.edu-item, .proj-item, .cert-item { margin-bottom:0.9rem; }.item-title { font-weight:600; font-size:0.88rem; }.item-sub { color:#666; font-size:0.8rem; }.item-desc { font-size:0.82rem; margin-top:0.3rem; color:#444; }.skills { display:flex; flex-wrap:wrap; gap:0.35rem; }.skill { background:#f0eeff; color:#6C63FF; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.78rem; font-weight:500; }.tech { font-size:0.78rem; color:#6C63FF; font-style:italic; }.summary { color:#444; font-size:0.85rem; line-height:1.6; }</style></head><body>';

    html += '<div class="header">';
    if (p.photo) {
        html += '<img src="' + p.photo + '" class="photo" alt="">';
    }
    html += '<div><div class="name">' + (p.name || 'Your Name') + '</div><div class="contact">';
    if (p.email) html += '<span>✉ ' + p.email + '</span>';
    if (p.phone) html += '<span>📞 ' + p.phone + '</span>';
    if (p.address) html += '<span>📍 ' + p.address + '</span>';
    if (p.linkedin) html += '<span>🔗 ' + p.linkedin + '</span>';
    if (p.github) html += '<span>💻 ' + p.github + '</span>';
    html += '</div></div></div>';

    if (p.summary) {
        html += '<div class="section"><div class="section-title">Summary</div><p class="summary">' + p.summary + '</p></div>';
    }

    // Education
    var eduItems = data.education.filter(function(e) { return e.degree || e.college; });
    if (eduItems.length > 0) {
        html += '<div class="section"><div class="section-title">Education</div>';
        eduItems.forEach(function(e) {
            html += '<div class="edu-item"><div class="item-title">' + (e.degree || '') + '</div><div class="item-sub">' + (e.college || '');
            if (e.start || e.end) html += ' • ' + (e.start || '') + (e.end ? '–' + e.end : '');
            if (e.gpa) html += ' • ' + e.gpa;
            html += '</div></div>';
        });
        html += '</div>';
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        html += '<div class="section"><div class="section-title">Skills</div><div class="skills">';
        data.skills.forEach(function(s) {
            html += '<span class="skill">' + s + '</span>';
        });
        html += '</div></div>';
    }

    // Projects
    var projItems = data.projects.filter(function(p) { return p.title || p.desc; });
    if (projItems.length > 0) {
        html += '<div class="section"><div class="section-title">Experience / Projects</div>';
        projItems.forEach(function(p) {
            html += '<div class="proj-item"><div style="display:flex;justify-content:space-between;align-items:start"><div><div class="item-title">' + (p.title || '') + (p.company ? ' @ ' + p.company : '') + '</div>';
            if (p.tech) html += '<div class="tech">' + p.tech + '</div>';
            html += '</div>';
            if (p.start || p.end) html += '<div class="item-sub" style="white-space:nowrap">' + (p.start || '') + (p.end ? '–' + p.end : '') + '</div>';
            html += '</div>';
            if (p.desc) html += '<div class="item-desc">' + p.desc + '</div>';
            html += '</div>';
        });
        html += '</div>';
    }

    // Certifications
    var certItems = data.certifications.filter(function(c) { return c.name; });
    if (certItems.length > 0) {
        html += '<div class="section"><div class="section-title">Certifications</div>';
        certItems.forEach(function(c) {
            html += '<div class="cert-item"><div class="item-title">' + c.name + '</div><div class="item-sub">' + (c.org || '') + (c.date ? ' • ' + c.date : '') + '</div></div>';
        });
        html += '</div>';
    }

    html += '</body></html>';
    return html;
}

// Save resume
window.saveResumeData = async function() {
    if (!currentUser) {
        console.error('No user authenticated');
        alert('Please log in first');
        return;
    }
    var data = collectFormData();
    var btn = document.getElementById('saveBtn');
    if (btn) { btn.innerHTML = '<div class="spinner"></div>';
        btn.disabled = true; }

    try {
        console.log('Saving resume for user:', currentUser.uid);
        var savedId = await saveResume(currentUser.uid, data, currentResumeId);
        currentResumeId = savedId;
        console.log('Resume saved with ID:', currentResumeId);

        // Update URL without reload
        var url = new URL(window.location);
        url.searchParams.set('id', currentResumeId);
        history.replaceState({}, '', url);

        if (btn) {
            btn.innerHTML = '<i class="bi bi-check2"></i> Saved';
            setTimeout(function() {
                btn.innerHTML = '<i class="bi bi-floppy"></i> Save';
                btn.disabled = false;
            }, 2000);
        }
    } catch (err) {
        console.error('Save error:', err);
        if (btn) {
            btn.innerHTML = '<i class="bi bi-floppy"></i> Save';
            btn.disabled = false;
        }
        alert('Failed to save resume: ' + (err.message || err));
    }
};

function scheduleSave() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(function() { if (currentUser) window.saveResumeData(); }, 2000);
}

// Load existing resume
async function loadExistingResume() {
    try {
        console.log('Loading resume:', currentResumeId);
        var data = await getResume(currentResumeId);
        if (!data) {
            console.warn('Resume not found:', currentResumeId);
            return;
        }
        console.log('Resume loaded successfully');

        function set(id, val) {
            var el = document.getElementById(id);
            if (el) el.value = val || '';
        }

        function setField(field, val) {
            var el = document.querySelector('[data-field="' + field + '"]');
            if (el) el.value = val || '';
        }

        set('resumeTitle', data.title);
        var p = data.personal || {};
        set('personalName', p.name);
        set('personalEmail', p.email);
        set('personalPhone', p.phone);
        set('personalAddress', p.address);
        set('personalLinkedin', p.linkedin);
        set('personalGithub', p.github);
        set('personalSummary', p.summary);
        if (p.photo) {
            photoDataURL = p.photo;
            var prev = document.getElementById('photoPreview');
            if (prev) {
                prev.src = p.photo;
                prev.style.display = 'block';
            }
        }

        if (data.skills) { skills = data.skills;
            renderSkills(); }
        currentTemplate = data.template || 'template1';

        (data.education || []).forEach(function(e, i) {
            if (i > 0) window.addEducation();
            var idx = i + 1;
            setField('edu-degree-' + idx, e.degree);
            setField('edu-college-' + idx, e.college);
            setField('edu-start-' + idx, e.start);
            setField('edu-end-' + idx, e.end);
            setField('edu-gpa-' + idx, e.gpa);
        });

        (data.projects || []).forEach(function(proj, i) {
            if (i > 0) window.addProject();
            var idx = i + 1;
            setField('proj-title-' + idx, proj.title);
            setField('proj-company-' + idx, proj.company);
            setField('proj-start-' + idx, proj.start);
            setField('proj-end-' + idx, proj.end);
            setField('proj-desc-' + idx, proj.desc);
            setField('proj-tech-' + idx, proj.tech);
        });

        (data.certifications || []).forEach(function(c, i) {
            if (i > 0) window.addCertification();
            var idx = i + 1;
            setField('cert-name-' + idx, c.name);
            setField('cert-org-' + idx, c.org);
            setField('cert-date-' + idx, c.date);
        });

        window.updatePreview();
    } catch (error) {
        console.error('Error loading resume:', error);
        alert('Could not load resume: ' + (error.message || error));
    }
}

// Init on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing builder');
    window.initPhotoUpload();
    attachPreviewTriggers(document);

    // Skill input enter key
    var skillInput = document.getElementById('skillInput');
    if (skillInput) {
        skillInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.addSkill();
            }
        });
    }

    // Switch section
    window.switchSection('personal');

    // Only update preview if we have auth (auth check happens in onAuthStateChanged)
    if (currentUser) window.updatePreview();
});