const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('vikas_token');
        }
        return null;
    }

    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('vikas_token', token);
        }
    }

    clearToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('vikas_token');
            localStorage.removeItem('vikas_user');
        }
    }

    getUser() {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('vikas_user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }

    setUser(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('vikas_user', JSON.stringify(user));
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(email, password, name) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        if (response.success) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }
        return response;
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.success) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            // Ignore logout errors
        }
        this.clearToken();
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // Products
    async getProducts(params = {}) {
        const searchParams = new URLSearchParams(params);
        return this.request(`/products?${searchParams}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async searchProducts(query) {
        return this.request(`/products/search/query?q=${encodeURIComponent(query)}`);
    }

    async getCategories() {
        return this.request('/products/meta/categories');
    }

    async getBrands() {
        return this.request('/products/meta/brands');
    }

    async getStoreAvailability(productId, filters = {}) {
        const searchParams = new URLSearchParams(filters);
        return this.request(`/products/${productId}/stores?${searchParams}`);
    }

    // Cart
    async getCart() {
        return this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return this.request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    }

    async updateCartItem(cartItemId, quantity) {
        return this.request(`/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    }

    async removeFromCart(cartItemId) {
        return this.request(`/cart/${cartItemId}`, {
            method: 'DELETE',
        });
    }

    async clearCart() {
        return this.request('/cart', { method: 'DELETE' });
    }

    // Orders
    async getOrders(params = {}) {
        const searchParams = new URLSearchParams(params);
        return this.request(`/orders?${searchParams}`);
    }

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    }

    async createOrder(shippingAddress, paymentMethod = 'cod') {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify({ shippingAddress, paymentMethod }),
        });
    }

    async buyNow(productId, quantity, shippingAddress, paymentMethod = 'cod') {
        return this.request('/orders/buy-now', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity, shippingAddress, paymentMethod }),
        });
    }

    async cancelOrder(orderId) {
        return this.request(`/orders/${orderId}/cancel`, { method: 'POST' });
    }

    // AI
    async aiQuery(query, productId = null, productIds = null) {
        return this.request('/ai/query', {
            method: 'POST',
            body: JSON.stringify({ query, productId, productIds }),
        });
    }

    async getRecommendations(productId) {
        return this.request(`/ai/recommendations/${productId}`);
    }

    async askProductQuestion(productId, question) {
        return this.request(`/ai/product/${productId}/ask`, {
            method: 'POST',
            body: JSON.stringify({ question }),
        });
    }

    async compareProducts(productIds) {
        return this.request('/ai/compare', {
            method: 'POST',
            body: JSON.stringify({ productIds }),
        });
    }

    // Reservations
    async createReservation(productId, storeId, quantity = 1) {
        return this.request('/reservations/create', {
            method: 'POST',
            body: JSON.stringify({ productId, storeId, quantity }),
        });
    }

    async payReservation(reservationId, paymentMethod = 'upi') {
        return this.request(`/reservations/${reservationId}/pay`, {
            method: 'POST',
            body: JSON.stringify({ paymentMethod }),
        });
    }

    async getReservation(reservationId) {
        return this.request(`/reservations/${reservationId}`);
    }

    async getMyReservations(status = null) {
        const params = status ? `?status=${status}` : '';
        return this.request(`/reservations/my${params}`);
    }

    async verifyReservation(qrData) {
        return this.request('/reservations/verify', {
            method: 'POST',
            body: JSON.stringify({ qrData }),
        });
    }

    // Admin
    async getAdminStats() {
        return this.request('/admin/stats');
    }

    async getUsers() {
        return this.request('/admin/users');
    }

    async getAdminOrders() {
        return this.request('/admin/orders');
    }

    async getAdminOrder(id) {
        return this.request(`/admin/orders/${id}`);
    }

    async updateOrderStatus(id, status) {
        return this.request(`/admin/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Admin: Stores
    async getStores() {
        return this.request('/admin/stores');
    }

    async createStore(storeData) {
        return this.request('/admin/stores', {
            method: 'POST',
            body: JSON.stringify(storeData)
        });
    }

    async updateStore(id, storeData) {
        return this.request(`/admin/stores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(storeData)
        });
    }

    async deleteStore(id) {
        return this.request(`/admin/stores/${id}`, {
            method: 'DELETE'
        });
    }

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(productId, updates) {
        return this.request(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteProduct(productId) {
        return this.request(`/products/${productId}`, {
            method: 'DELETE',
        });
    }
}


export const api = new ApiClient();
export default api;
