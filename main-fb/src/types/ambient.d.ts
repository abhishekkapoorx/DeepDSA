declare module "@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string)
    getGenerativeModel(opts: { model: string }): any
  }
}


