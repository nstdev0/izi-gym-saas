export interface IAuthProvider {
    getUserById(id: string): Promise<{ email: string; imageUrl: string } | null>
}