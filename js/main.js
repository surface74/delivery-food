'use strict';

const cartButton = document.querySelector("#cart-button"),
  modal = document.querySelector(".modal"),
  close = document.querySelector(".close"),
  buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  logInForm = document.querySelector('#logInForm'),
  loginInput = document.querySelector('#login'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  cardsRestaurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  cardsMenu = document.querySelector('.cards-menu'),
  restaurantTitle = menu.querySelector('.restaurant-title'),
  rating = menu.querySelector('.rating'),
  price = menu.querySelector('.price'),
  category = menu.querySelector('.category'),
  logos = document.querySelectorAll('.logo'),
  inputSearch = document.querySelector('.input-search'),
  modalBody = document.querySelector('.modal-body'),
  modalPriceTag = document.querySelector('.modal-pricetag'),
  buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('df-name') || '';
const cart = [];


const saveCart = () => {
  if (cart.length > 0) {
    localStorage.setItem(`df-cart-${login}`, JSON.stringify(cart));
  }
};

const loadCart = () => {
  cart.length = 0;
  if (localStorage.getItem(`df-cart-${login}`)) {
    cart.push(...JSON.parse(localStorage.getItem(`df-cart-${login}`)));
    // JSON.parse(localStorage.getItem(`df-cart-${login}`))
    //   .forEach(item => cart.push(item));
  }
}

const clearCart = () => {
  cart.length = 0;
  localStorage.removeItem(`df-cart-${login}`);
}

//gets list of restaurant from db
const getData = async function (url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}: ${response.state}`)
  }
  return await response.json();
}

//checks user name
const validateName = (str) => {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,19}$/;
  return nameReg.test(str);
}

const toggleModal = () => {
  modal.classList.toggle("is-open");
}

const toggleModalAuth = () => {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle("is-open");
}

const logIn = (event) => {
  event.preventDefault();
  //check input
  if (validateName(loginInput.value.trim())) {
    login = loginInput.value.trim();
    localStorage.setItem('df-name', login);
    toggleModalAuth();

    buttonAuth.removeEventListener('click', toggleModalAuth);
    closeAuth.removeEventListener('click', toggleModalAuth);
    logInForm.removeEventListener('submit', logIn);
    logInForm.reset();
    checkAuth();
  } else {
    loginInput.value = '';
    loginInput.style.borderColor = 'red';
  }
}

const logOut = () => {
  localStorage.removeItem('df-name');
  login = '';
  cart.length = 0;
  userName.textContent = login;
  userName.style.display = '';
  buttonOut.style.display = '';
  buttonAuth.style.display = '';
  cartButton.style.display = '';
  buttonOut.removeEventListener('click', logOut);
  openRestaurants();
  checkAuth();
}

const authorized = () => {
  console.log('Авторизован');
  userName.textContent = login;
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  buttonAuth.style.display = 'none';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart();
}

const notAuthorized = () => {
  console.log('Не авторизован');
  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

const checkAuth = () => { (login) ? authorized() : notAuthorized(); }

//adds restaurant's card to page
const createCardRestaurant = ({
  image, kitchen, name, price,
  products, stars, time_of_delivery: timeOfDelivery
}) => {
  const card = `
    <a class="card card-restaurant" data-products='${products}'>
    <img src="${image}" alt="image" class="card-image" />
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
      <div class="card-info">
        <div class="rating">
          ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  </a>
  `;
  cardsRestaurants.insertAdjacentHTML('beforeend', card);
}

//adds good's card to page
const createCardGood = ({ description, image, name, price, id }) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image" />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <div class="card-info">
          <div class="ingredients">${description}
          </div>
        </div>
        <div class="card-buttons"">
          <button class="button button-primary button-add-cart" id="${id}">
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price-bold">${price} ₽</strong>
        </div>
      </div>
  `);
  cardsMenu.insertAdjacentElement('beforeend', card);
}

//hides restaurants, shows goods
const openGoods = (event) => {
  if (login) {
    const restaurant = event.target.closest('.card-restaurant');

    if (restaurant) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      restaurantTitle.textContent = restaurant.querySelector('.card-title').textContent;
      rating.textContent = restaurant.querySelector('.rating').textContent;
      price.textContent = restaurant.querySelector('.price').textContent;
      category.textContent = restaurant.querySelector('.category').textContent;

      getData(`./db/${restaurant.dataset.products}`).then(function (data) {
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
}

//hides goods, shows restaurants
const openRestaurants = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

//adds click handler to return to restaurants view
const addClickEventListener = (item) => { item.addEventListener('click', openRestaurants); }

//adds a good to the cart
const addToCart = (event) => {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');

  if (!buttonAddToCart) return;

  const card = target.closest('.card');
  const title = card.querySelector('.card-title-reg').textContent;
  const cost = card.querySelector('.card-price-bold').textContent;
  const id = buttonAddToCart.id;

  const food = cart.find(item => item.id === id);

  if (food)
    food.count++;
  else
    cart.push({ id, title, cost, count: 1 });

  saveCart();
}

//shows cart's content and counts totals
const renderCart = () => {
  modalBody.textContent = '';
  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
    	<div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `;
    modalBody.insertAdjacentHTML('beforeend', itemCart);
  });

  const totalPrice = cart.reduce((result, item) => { return result + item.count * parseFloat(item.cost); }, 0);
  modalPriceTag.textContent = totalPrice + "  ₽";
}

//changes count of goods from cart's modal form
const changeCount = (event) => {
  const target = event.target;
  if (target.classList.contains('counter-button')) {
    const food = cart.find(item => item.id === target.dataset.id);
    if (target.classList.contains('counter-minus')) {
      if (--food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
        if (cart.length === 0) {
          clearCart();
          toggleModal();
        }
      }
    } else if (target.classList.contains('counter-plus'))
      food.count++;
  }
  saveCart();
  renderCart();
}

//looks for the good with certain word into the name or ingridients 
//and shows its
const searchGoods = (event) => {
  if (event.keyCode !== 13) return;

  const target = event.target;
  const value = target.value.trim().toLowerCase();
  target.value = '';

  if (!value || value.length < 3) {
    target.style.borderColor = 'red';
    setTimeout(() => { target.style.borderColor = ''; }, 2000);
    return;
  }

  getData('./db/partners.json')
    .then((data) => {
      const products = data.map(item => item.products); //gets list of restaurants

      products.forEach(product => {
        getData(`./db/${product}`)  //gets list of goods
          .then(food => {
            const search = food.filter(item => item.name.toLowerCase().includes(value)
              || item.description.toLowerCase().includes(value)
            );
            search.forEach(createCardGood);
          })
      })
    })

  cardsMenu.textContent = '';

  containerPromo.classList.add('hide');
  restaurants.classList.add('hide');
  menu.classList.remove('hide');

  restaurantTitle.textContent = 'Результат поиска';
  rating.textContent = '';
  price.textContent = '';
  category.textContent = '';
};

const init = () => {
  getData('./db/partners.json').then(data => { data.forEach(createCardRestaurant); });

  cartButton.addEventListener('click', renderCart);
  cartButton.addEventListener('click', toggleModal);

  buttonClearCart.addEventListener('click', clearCart);
  buttonClearCart.addEventListener('click', toggleModal);

  modalBody.addEventListener('click', changeCount);

  cardsMenu.addEventListener('click', addToCart);

  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener('click', openGoods);

  logos.forEach(addClickEventListener);

  inputSearch.addEventListener('keydown', searchGoods)

  checkAuth();
  new Swiper('.swiper-container', { loop: true, autoplay: true });
}

init();