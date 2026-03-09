export function downloadResumePDF(elementId, filename = 'resume.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const btn = document.getElementById('downloadBtn');
  if (btn) {
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating PDF...';
    btn.disabled = true;
  }

  html2pdf().set(opt).from(element).save().then(() => {
    if (btn) {
      btn.innerHTML = '<i class="bi bi-download me-2"></i>Download PDF';
      btn.disabled = false;
    }
  });
}
