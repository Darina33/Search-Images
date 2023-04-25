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
loadMoreBtn.button.addEventListener("click", fetchImage);


function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    pixabay.query = form.elements.searchQuery.value.trim();

    if (pixabay.query === "") {
        Notify.info("Field cannot be empty")
        return;
    }
    loadMoreBtn.show();
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
        const { hits, totalHits } = await pixabay.getImage();
        const limitPage = Math.ceil(totalHits / pixabay.per_page);
        
        if (hits.length === 0) {
            Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            throw new Error;
        } else if (pixabay.page > limitPage) {
            loadMoreBtn.hide();
            Notify.failure(
            "We're sorry, but you've reached the end of search results.");
        } 
        Notify.info(`Hooray! We found ${totalHits} images.`)
            return hits.reduce((markup, hits) => markup + createMarkup(hits), "");
            
        } catch (err) {
          onError(err);
        }
}
    
function createMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
    return `<div class="photo-card"><a href="${largeImageURL}" alt="${tags}" class="gallery__link">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"  class="gallery__image" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`
}

function updateNewsList(markup) {
    if (markup !== undefined)
        refs.gallery.insertAdjacentHTML("beforeend", markup)
    
      const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearNewsList() {
    refs.gallery.innerHTML = '';
}

function onError(err) {
    console.error(err);
    loadMoreBtn.hide();
    clearNewsList();
}

window.onscroll = function () { scrollFunction() };
const btn = document.getElementById("myBtn");

btn.addEventListener("click", topFunction)

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
