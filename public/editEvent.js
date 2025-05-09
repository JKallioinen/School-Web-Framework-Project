
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editEventForm');
  
    document.querySelectorAll('.open-edit-modal').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const title = button.dataset.title;
        const start = new Date(button.dataset.start).toISOString().slice(0, 16);
        const end = button.dataset.end ? new Date(button.dataset.end).toISOString().slice(0, 16) : '';
        const description = button.dataset.description || '';
        const importance = button.dataset.importance;
  
        // Set form action dynamically
        form.action = `/events/${id}?_method=PUT`;
  
        // Fill inputs
        document.getElementById('edit-title').value = title;
        document.getElementById('edit-start').value = start;
        document.getElementById('edit-end').value = end;
        document.getElementById('edit-description').value = description;
        document.getElementById('edit-importance').value = importance;
      });
    });
  });
  