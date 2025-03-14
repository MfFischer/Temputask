export interface DbInterface {
    query: (text: string, params?: any[]) => Promise<any>;
  }
  
  
  
  