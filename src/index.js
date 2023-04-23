import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import LoadMoreBtn from './components/ReadMoreButton.js';
import './sass/index.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import pixabayApiService from "./pixabayApiService.js";

const refs = {
    form: document.getElementById("search-form"),
    gallery: document.querySelector(".gallery"),
}

const pixabay = new pixabayApiService();
const loadMoreBtn = new LoadMoreBtn({
    selector: ".load-more",
    isHidden: true,
})
let gallery;


refs.form.addEventListener("submit", onSubmit);
loadMoreBtn.button.addEventListener("click", fetchImage)


function onSubmit(e) {
    e.preventDefault();
    loadMoreBtn.show();
    const form = e.currentTarget;
    pixabay.query = form.elements.searchQuery.value;

    clearNewsList();
    pixabay.resetPage();
    fetchImage().finally(() => form.reset())
}

async function fetchImage() {
    loadMoreBtn.disable();
    

    try {
        const markup = await getImagesMarkup();
        updateNewsList(markup);
        loadMoreBtn.enable();
        gallery = new SimpleLightbox('.gallery a').refresh();
    } catch (err) {
        onerror(err)
    }
}

async function getImagesMarkup() {
    try {
        const { hits } = await pixabay.getImage();
        console.log(hits);
        if (hits.length === 0)
            throw new Error("Sorry, there are no images matching your search query. Please try again.");
            return hits.reduce((markup, hits) => markup + createMarkup(hits), "")
        } catch (err) {
            onError(err);
        }
}
    
function createMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
    return `<div class="photo-card"><a href="${largeImageURL}" alt="${tags}" class="gallery__link">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"  class="gallery__image" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`
}

function updateNewsList(markup) {
    if (markup !== undefined)
        refs.gallery.insertAdjacentHTML("beforeend", markup)
}

function clearNewsList() {
    refs.gallery.innerHTML = '';
}

function onError(err) {
    console.error(err);
    loadMoreBtn.hide();
    clearNewsList();
}
