document.querySelectorAll('.wpcf7-form').forEach(form => {
  form.removeAttribute('novalidate');
  form.querySelectorAll('[aria-required="true"]').forEach(field => field.required = true);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const output = form.querySelector('.wpcf7-response-output');
    output.replaceChildren();
    output.style.display = 'block';
    output.setAttribute('aria-hidden', 'false');
    output.setAttribute('role', 'status');
    output.append('This replica is not connected to email delivery. Your message has not been sent. ');
    const link = document.createElement('a');
    link.textContent = 'Open an email draft';
    const data = new FormData(form);
    const body = `Name: ${data.get('your-name')}\nEmail: ${data.get('your-email')}\nPhone: ${data.get('tel-9')}\n\n${data.get('your-message')}`;
    link.href = 'mailto:Admin@apjcert.com?subject=' + encodeURIComponent(data.get('your-subject')) + '&body=' + encodeURIComponent(body);
    output.append(link);
  });
});
