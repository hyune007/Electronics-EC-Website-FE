import api from './api';

// Customer
export async function login({ email, password }) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
}

export async function register({ name, email, password, phone }) {
    const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        phone,
    });
    return response.data;
}

export async function fetchCustomerByEmail(email) {
    const safeEmail = encodeURIComponent(email);
    const response = await api.get(`/api/customer/mail/${safeEmail}`);
    return response.data;
}

// Employee
export async function loginEmployee({ email, password }) {
    const response = await api.post('/api/auth/employee/login', { email, password });
    return response.data;
}

export async function registerEmployee({ name, email, password, phone }, roleId = 'ROLE_EMPLOYEE') {
    const response = await api.post(`/api/auth/employee/register?roleId=${roleId}`, {
        name,
        email,
        password,
        phone,
    });
    return response.data;
}
