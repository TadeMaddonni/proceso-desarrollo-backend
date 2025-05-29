export class AuthService {
    getStatus() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        };
    }

    signup(email: string, password: string) {
        return {
            email,
            password
        };
    }
}