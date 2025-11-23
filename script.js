const API_URL = 'https://jsonplaceholder.typicode.com/users';
let users = [];
let currentPage = 1;
const itemsPerPage = 5;
let isEditing = false;

// DOM Elements
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const modal = document.getElementById('user-modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.querySelector('.close');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('modal-title');

// Inputs
const userIdInput = document.getElementById('user-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});

// Fetch Users
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        users = await response.json();
        renderTable();
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching data: ' + error.message);
    }
}

// Render Table with Pagination and Search
function renderTable() {
    tableBody.innerHTML = '';

    // Filter
    const searchTerm = searchInput.value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    // Ensure currentPage is valid
    if (currentPage > totalPages) currentPage = totalPages || 1;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Render Rows
    currentUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <button class="btn edit-btn" onclick="openEditModal(${user.id})">Edit</button>
                <button class="btn delete-btn" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update Pagination Controls
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Search Event
searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderTable();
});

// Pagination Events
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

nextBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm));
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});

// Modal Logic
addBtn.onclick = () => {
    isEditing = false;
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    userIdInput.value = '';
    modal.style.display = 'block';
};

closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Open Edit Modal
window.openEditModal = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
        isEditing = true;
        modalTitle.textContent = 'Edit User';
        userIdInput.value = user.id;
        nameInput.value = user.name;
        emailInput.value = user.email;
        phoneInput.value = user.phone;
        modal.style.display = 'block';
    }
};

// Handle Form Submit (Create or Update)
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value
    };

    try {
        if (isEditing) {
            // Update User
            const id = parseInt(userIdInput.value);
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) throw new Error('Failed to update user');
            
            // Manual UI Update
            const index = users.findIndex(u => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...userData };
                alert('User updated successfully (simulated)');
            }

        } else {
            // Create User
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) throw new Error('Failed to create user');
            
            const newUser = await response.json();
            
            // JSONPlaceholder always returns ID 11 for new items, so we simulate a unique ID for UI
            newUser.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            
            // Manual UI Update
            users.push(newUser);
            alert('User added successfully (simulated)');
        }

        modal.style.display = 'none';
        renderTable();

    } catch (error) {
        console.error('Error:', error);
        alert('Operation failed: ' + error.message);
    }
});

// Delete User
window.deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete user');

            // Manual UI Update
            users = users.filter(user => user.id !== id);
            renderTable();
            alert('User deleted successfully (simulated)');

        } catch (error) {
            console.error('Error:', error);
            alert('Delete failed: ' + error.message);
        }
    }
};
