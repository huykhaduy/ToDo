// Project will be weakness if
// - Your DOM component is complex
// - Has many todos and we change todos information. It will make empty todos view and render from the beginning

// Using for store data
class Model{
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  _commit(todos){
    this.onToDoListChange(todos);
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  addToDo(text){
    this.todos.push({
      id: this.todos.length + 1,
      text: text,
      complete: false,
    });
    this._commit(this.todos);
  }

  editToDo(id, updateText){
    this.todos = this.todos.map(todo =>{
      if (todo.id === id){
        todo.text = updateText;
      }
      return todo;
    });
    this._commit(this.todos);
  }

  removeToDo(id){
    this.todos = this.todos.filter(todo => todo.id !== id);
    this._commit(this.todos);
  }

  toggleToDo(id){
    this.todos = this.todos.map(todo => {
      todo.id === id ? todo.complete = !todo.complete : todo.complete;
      return todo;
    });
    this._commit(this.todos);
  }

  bindTodoListChange(callback){
    this.onToDoListChange = callback;
  }
}

// Using for display data
class View{
  constructor() {
    this.app = this.getElement('#root');
    this.title = this.createElement('h1');
    this.title.textContent = 'Todos';

    this.form = this.createElement('form');
    this.input = this.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Add todo';
    this.input.name = 'todo';

    this.submitButton = this.createElement('button');
    this.submitButton.textContent = 'Submit';

    this.todoList = this.createElement('ul', 'todo-list');
    this.form.append(this.input, this.submitButton);
    this.app.append(this.title, this.form, this.todoList);

    this._temporaryText = '';
    this._initLocalListener();
  }

  createElement(tag, className){
    const elm = document.createElement(tag);
    if (className)
      elm.classList = className;
    return elm;
  }

  getElement(selector){
    return document.querySelector(selector);
  }

  get _todoText(){
    return this.input.value.trim();
  }

  _resetInput(){
    this.input.value = '';
  }

  displayTodos(todos){
    // This is why react using find different and change at diff
    while(this.todoList.firstChild){
      this.todoList.removeChild(this.todoList.firstChild);
    }

    if (todos.length === 0){
      const p = this.createElement('p');
      p.textContent = 'Nothing to do! Add a task';
      this.todoList.append(p);
    }
    else {
      todos.forEach(todo => {
        const li = this.createElement('li');
        li.id = todo.id;

        const checkbox = this.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.complete;

        const span = this.createElement('span', 'editable');
        span.contentEditable = true;

        if (todo.complete){
          const strike = this.createElement('s');
          strike.textContent = todo.text;
          span.append(strike);
        }
        else {
          span.textContent = todo.text;
        }

        const delButton = this.createElement('button', 'delete');
        delButton.textContent = 'Delete';
        li.append(checkbox, span, delButton);

        this.todoList.append(li);
      });
    }
  }

  _initLocalListener(){
    this.todoList.addEventListener('input', event=>{
      if (event.target.className.includes('editable'))
        this._temporaryText = event.target.innerText;
    });
  }

  bindAddTodos(handler){
    this.form.addEventListener('submit', event=>{
      event.preventDefault();

      if (this._todoText){
        handler(this._todoText);
        this._resetInput();
      }
    });
  }

  bindEditTodos(handler){
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryText){
        handler(parseInt(event.target.parentElement.id), this._temporaryText);
        this._temporaryText = '';
      }
    });
  }

  bindDeleteTodos(handler){
    this.todoList.addEventListener('click', event=>{
      if (event.target.className === 'delete'){
        handler(parseInt(event.target.parentElement.id));
      }
    });
  }

  bindToggleTodos(handler){
    this.todoList.addEventListener('change', event=>{
      if (event.target.type === 'checkbox'){
        handler(parseInt(event.target.parentElement.id));
      }
    });
  }
}

// Using for route dispay data for a model
class Controller{
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.handleAddTodos = todoText => {
      this.model.addToDo(todoText);
    };

    this.handleEditTodos = (id, todoText) => {
      this.model.editToDo(id, todoText);
    };

    this.handleDeleteTodos = id => {
      this.model.removeToDo(id);
    };

    this.handleToggleTodos = id => {
      this.model.toggleToDo(id);
    };

    this.onTodoListChanged = todos => {
      this.view.displayTodos(todos);
    };

    this.model.bindTodoListChange(this.onTodoListChanged);
    this.view.bindAddTodos(this.handleAddTodos);
    this.view.bindDeleteTodos(this.handleDeleteTodos);
    this.view.bindToggleTodos(this.handleToggleTodos);
    this.view.bindEditTodos(this.handleEditTodos);

    this.onTodoListChanged(this.model.todos);
  }
}

const app = new Controller(new Model(), new View());
// app.handleAddTodos('Hello world');
console.log(app);
