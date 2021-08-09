// Functions to make request. Accepts 2 arguments string - method (POST, GET and etc)
// Second argument is url
// Returns Promise
// As request function use XMLHttpRequest;
function makeRequest(method, url) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.addEventListener('load', () => {
      if (xhr.status < 400)
        resolve(xhr.response);
      else reject(new Error('Request failed: ' + xhr.statusText));
    });
    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });
    xhr.send();
  });
}

// Class for create todoItem. Used only with user entered todos. In constructor receives string.
function randomId(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
class TodoListItem {
  constructor(todo) {
    this.title = todo; // todoitem itself
    this.id = randomId(100, 200); // Id random numeric id form 100 to 200
    this.userId = randomId(100, 200); // Id random numeric id form 100 to 200
    this.complete = false; // completed status. Boolean.
  }
}


class App {
  constructor(list, storageKey,) {
    this._list =  list; // list of items. Taken from constructor arguments. IF not passed default [] must be used
    this._storageKey = storageKey; // String. StorageKey Taken from constructor arguments. IF not passed default 'myTodoAppList' must be used
  };
  
  // // Fetch todos from external source Async function - you need to wait for result. Pay attention of type of result you
  // // are receiving (hint it could be not Array); But you must return Array here
  async fetchTodos() {
    /// url to fetch todos ==== https://jsonplaceholder.typicode.com/users/1/todos
    const result = await makeRequest('GET', 'https://jsonplaceholder.typicode.com/users/1/todos');
    return JSON.parse(result);
  }
  
  // // Checks if there is key in local storage. If not - creates with key which is in class and sets empty value of array
  setStorage() {
    if (!localStorage.getItem(this._storageKey)) {
      this.addToStorage([]);
    }
  }
  
  // // Reads storage for items. If there key and storage items - adds to list in class.
  // // If not - fetch items and add them to list and to storage
  // // Also for each todos added to _list this function calls create element with append
  async readStorage() {
    const storageItems = JSON.parse(localStorage.getItem(this._storageKey));
    console.log(storageItems);
    if (storageItems.length) {
      this._list = storageItems;
    } else {
      const todos = await this.fetchTodos();
      this._list = todos;
      this.addToStorage(todos);
    }
    this._list.forEach((todo) => {
      this.createListItemElement(todo, 'append');
    })
  }
  
  // // Sets _list to localstorage, with key is defined in class
  addToStorage(list = this._list) {
    localStorage.setItem(this._storageKey, JSON.stringify(list));
  }
  
  // Creates app template - main with 2 sections inside - first will be used for form
  // and second will be used for list. Dont forget about classes and BEM
  createTemplate() {
    const main = document.createElement('main');
    main.classList.toggle('app-main');
    
    const formSection = document.createElement('section');
    formSection.classList.toggle('app-main__form');
    const listSection = document.createElement('section');
    listSection.classList.toggle('app-main__list');

    document.querySelector('#app').appendChild(main);
    main.appendChild(formSection);
    main.append(listSection);
  }
  
  // Creates form which contains text input and submit button. Please do not forget
  // about classes (BEM). Also event listener for form submit defined here.
  // as argument it accepts event type and class method. Please care here about this for class method.
  // Also please care about basic validation - form must not be submitted if input is empty (HTML5 validation)
  createForm() {
    const form = document.createElement('form');
    form.classList.toggle('app-form');

    const input = document.createElement('input');
    input.classList.toggle('app-form__input');
    input.type = 'text';
    input.required = true;
    form.appendChild(input);

    const submitBtn = document.createElement('button');
    submitBtn.innerText = 'Add';
    submitBtn.type = 'submit';
    form.appendChild(submitBtn);

    document.querySelector('.app-main__form').appendChild(form);
    document.querySelector('.app-form').addEventListener('submit', this.submitFormHandler.bind(this));
  }
  
  // Creates list for items. Also event listener for click on list item defined here.
  // as argument it accepts event type and class method. Please care here about this for class method.
  createList() {
    const list = document.createElement('ul');
    list.classList.toggle('app-list');
    document.querySelector('.app-main__list').appendChild(list);
    document.querySelector('.app-list').addEventListener('click', this.clickListItemHandler.bind(this));
  }
  
  // Creates list item with todos. Please check of todos status - if completed - checkbox must be checked.
  // list item must have checkbox, todos title and button for delete. Each list item must have unique ID,
  // added as data attribute. Also his function besides todoitem accepts second argument - type.
  // If append - list must append todoitem. Else - must prepend.
  createListItemElement(todoItem, type) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    if (todoItem.completed) {
      checkbox.checked = true;
    }
    const text = document.createElement('span');
    text.innerText = todoItem.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'X';

    const listItem = document.createElement('li');
    listItem.classList.toggle('app-list__item');
    listItem.setAttribute('data-id', todoItem.id);

    listItem.appendChild(checkbox);
    listItem.appendChild(text);
    listItem.appendChild(deleteBtn);

    document.querySelector('.app-list').appendChild(listItem);

    if (type === 'append') {
      document.querySelector('.app-list').appendChild(listItem);
    } else {
      document.querySelector('.app-list').prepend(listItem);
    }
  }
  
  // universal function for handling click on item list. Must check what type of event is passed as argument
  // and call function for mark todoitem as done or delete it fron _list and element from dom
  // ID of todoitem you can get from closest li where in attribute data todoitem id is.
  clickListItemHandler(event) {
   const id = event.target.closest('li').dataset.id;
   if (event.target.type === 'checkbox') {
     this.toggleListItemToggleDone(id);
   }
   if (event.target.type === 'submit') {
     this.deleteListItem(id);
     this.deleteListItemElement(id);
   }
  }
  
  // Toggles todoitem done. You need find item in list and toggle its completed property value to opposite
  // Hint - use index
  // Also you need add changed list to storage;
  toggleListItemToggleDone(id) {
    let index = this._list.findIndex((item) => item.id === Number(id));
    this._list[index].completed = !this._list[index].completed;
    this.addToStorage();
  }
  
  // Delete from list todoItem.
  // Hint - use index
  // Also you need save changed list to storage;
  deleteListItem(id) {
    let index = this._list.findIndex((item) => item.id === Number(id));
    this._list.splice(index, 1);
    this.addToStorage(); 
  }
  
  // Delete from DOM from list todoitem based on passed ID. Query this item on dataset
  deleteListItemElement(id) {
    document.querySelector('.app-list').removeChild(document.querySelector(`li[data-id="${id}"]`));
  }
  
  // Submits todoitem from form. Form default behaviour must not be used
  // New todoitem must be class (see above)
  // Also you need add to list, create element in dom and clear event target value, in order to be able to
  // add new todos
  submitFormHandler(event) {
    event.preventDefault();
    const newTodoItem = new TodoListItem(event.target[0].value);
    this.addToList(newTodoItem);
    this.createListItemElement(newTodoItem);
    event.target[0].value = '';
  }
  
  // Adds item to _list (ARRAY method use here to add at THE BEGINNING of the list
  // Also adds to storage;
  addToList(todoItem) {
    this._list.unshift(todoItem);
    this.addToStorage();
  }
  
  // Inits app
  async init() {
    this.createTemplate();
    this.createForm();
    this.createList();
    this.setStorage();
    await this.readStorage();
  }
}

const app = new App();

app.init();