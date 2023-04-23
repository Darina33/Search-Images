import axios from 'axios';


export default class pixabayApiService {
    static ENDPOINT = "https://pixabay.com/api/";
    static API_KEY = "35592946-b30e38cecc5f402f2c111ab69";

    constructor() {
    this.query = "";
    this.page = 1;
    }
    
    async getImage() {
      const url = `${pixabayApiService.ENDPOINT}?key=${pixabayApiService.API_KEY}&q=${this.query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`;

      const { data } = await axios.get(url);
      this.incrementPage();

      return data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}
