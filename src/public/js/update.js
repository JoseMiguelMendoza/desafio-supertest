document.addEventListener('DOMContentLoaded', () => {
    const updateButtons = document.querySelectorAll('.buttonUpdateForm');

    updateButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();

        const idInput = document.getElementById('id').value
        const updatedProduct = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: Number(document.getElementById('price').value),
            code: Number(document.getElementById('code').value),
            stock: Number(document.getElementById('stock').value),
            category: document.getElementById('category').value
        };

        if(!idInput || !updatedProduct.title || !updatedProduct.description || !updatedProduct.price || !updatedProduct.code || !updatedProduct.stock || !updatedProduct.category){
            return Swal.fire({
                icon: 'error',
                title: 'Formulario Incompleto',
                text: 'Todos los campos deben ser rellenados.',
                showConfirmButton: true
            });
        }else{
            try {
                const response = await fetch(`/api/products/${idInput}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
                });
    
                const result = await response.json();
                if (response.ok) {
                    Swal.fire({
                    icon: 'success',
                    title: 'Producto Actualizado',
                    text: 'El producto ha sido actualizado correctamente.',
                    showConfirmButton: false,
                    timer: 3000
                    });
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            }

        }

    });
        });
});