export interface ApiResponse<T> {
    statusCode: number;
    messege: string;
    data?: T | null;
  }

export function apiResponse<T>(statusCode: number, messege: string, data?: T){
    return {
        statusCode,
        messege,
        data: data ?? null
    }
}