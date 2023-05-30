import './sass/index.scss';
import { PixabayAPI } from './pixabay_api';
import Notiflix from 'notiflix';
import createGallery from '../src/templates/cardGallery.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const btnLoadMoreEl = document.querySelector('.load-more');

const pixabayAPI = new PixabayAPI();
let gallery;

formEl.addEventListener('submit', handleFormSubmit);
btnLoadMoreEl.addEventListener('click', handleLoadMoreBtnClick);

function handleFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';
  btnLoadMoreEl.classList.add('is-hidden');
  const form = event.currentTarget;
  const searchQuery = form.elements['searchQuery'].value.trim();
  pixabayAPI.q = searchQuery;

  if (!searchQuery) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  searchGallery();
}

async function searchGallery() {
  try {
    const { data } = await pixabayAPI.fetchImgs();

    if (data.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    galleryEl.innerHTML = createGallery(data.hits);

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

    gallery = new SimpleLightbox('.gallery a');
    gallery.refresh();

    if (data.totalHits > pixabayAPI.per_page) {
      btnLoadMoreEl.classList.remove('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

function handleLoadMoreBtnClick() {
  pixabayAPI.page += 1;
  searchLoadMoreImg();
}

async function searchLoadMoreImg() {
  try {
    const { data } = await pixabayAPI.fetchImgs();
    if (data.hits.length < pixabayAPI.per_page) {
      btnLoadMoreEl.classList.add('is-hidden');
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      galleryEl.insertAdjacentHTML('beforeend', createGallery(data.hits));
      gallery.refresh();
    }
  } catch (error) {
    console.log(error);
  }

  if (pixabayAPI.page >= pixabayAPI.totalPages) {
    btnLoadMoreEl.classList.add('is-hidden');
  }
}
