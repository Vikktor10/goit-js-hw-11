import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { getApiImg } from './js/searchApi.js';

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputForm: document.querySelector('.form-input'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let inputValue = '';
let page = 1;
let perPage = 40;
let totalHits;

const lightbox = new SimpleLightbox('.gallery a');

Notiflix.Notify.init({
  timeout: 2000,
});

refs.loadMoreBtn.classList.add('is-hidden');

refs.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  page = 1;

  clearGallery();
  getGalleryItems();

  page += 1;
});

refs.loadMoreBtn.addEventListener('click', () => {
  oncheckTotalPages();
  getLoadMoreItems();

  page += 1;
});

function clearGallery() {
  refs.gallery.innerHTML = '';
}

async function getGalleryItems() {
  inputValue = refs.inputForm.value.trim();
  if (!inputValue) {
    return;
  }

  try {
    const searchGallery = await getApiImg(inputValue, page);
    createGallery(searchGallery.hits);

    if (searchGallery.totalHits) {
      refs.loadMoreBtn.classList.remove('is-hidden');
      Notiflix.Notify.success(
        `Hooray! We found ${searchGallery.totalHits} images.`
      );
    }
    totalHits = searchGallery.totalHits;

    if (totalHits < perPage) {
      refs.loadMoreBtn.classList.add('is-hidden');
    }

    onSearchHits(searchGallery.totalHits);
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

function createMarkupItem({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card">
    <a class="photo__link" href="${largeImageURL}">
        <img class="gallery__image" src="${webformatURL}" loading="lazy" alt="${tags}" />
        </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
  </div>
  </div>`;
}

function createGallery(arr) {
  const galleryList = arr.reduce(
    (acc, item) => acc + createMarkupItem(item),
    ''
  );
  return refs.gallery.insertAdjacentHTML('beforeend', galleryList);
}

function onSearchHits(total) {
  if (!total) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again..'
    );
    return;
  }
}

async function getLoadMoreItems() {
  try {
    const searchGallery = await getApiImg(inputValue, page);
    createGallery(searchGallery.hits);
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

function oncheckTotalPages() {
  if (page >= Math.ceil(totalHits / perPage)) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
  }
}
