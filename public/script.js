document.addEventListener('DOMContentLoaded', function () {
    const deleteLinks = document.querySelectorAll('.delete-btn');

    deleteLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            const confirmDelete = confirm('Are you sure you want to delete this task?');
            if (confirmDelete) {
                window.location.href = this.getAttribute('href');
            }
        });
    });
});