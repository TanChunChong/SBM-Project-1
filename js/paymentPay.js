document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const price = params.get('price');

    if (plan && price) {
        document.getElementById('plan-name').textContent = plan;
        document.getElementById('plan-price').textContent = price;
        document.getElementById('total-price').textContent = price;
    }
});