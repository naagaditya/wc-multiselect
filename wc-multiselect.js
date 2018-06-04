class WcMultiselect extends HTMLElement{
  constructor () {
    super();
    this.template = document.createElement('template');
    this.list = [
      'item1',
      'item2',
      'item3',
      'item4'
    ];
    this.filterList = [];
    this.selectedItems = [];
    this.updateFilteredList = this.updateFilteredList.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }
  get htmlTemplate () {
    return `<style>
        :host {
          display: block;
        }
        .wrapper {
          position: relative;
        }
        .down-arrow {
          position: absolute;
          width: 40px;
          height: 38px;
          right: 1px;
          top: 1px;
          padding: 4px 8px;
          text-align: center;
          transition: transform .2s ease;
        }
        .down-arrow:before {
          position: relative;
          right: 0;
          top: 65%;
          color: #999;
          margin-top: 4px;
          border-style: solid;
          border-width: 5px 5px 0;
          border-color: #999 transparent transparent;
          content: "";
        }
        .tags {
          min-height: 40px;
          padding: 8px 40px 0 8px;
          border-radius: 5px;
          border: 1px solid #e8e8e8;
          background: #fff;
          font-size: 14px;
        }
        .tags > input {
        }
        .content {
          position: absolute;
          display: block;
          background: #fff;
          width: 100%;
          max-height: 240px;
          overflow: auto;
          border: 1px solid #e8e8e8;
          border-top: none;
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
          z-index: 3;
        }
        .tag {
          position: relative;
          display: inline-block;
          padding: 4px 26px 4px 10px;
          border-radius: 5px;
          margin-right: 10px;
          color: #fff;
          line-height: 1;
          background: #41b883;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          max-width: 100%;
          text-overflow: ellipsis;
        }
        .close-icon {
          cursor: pointer;
          margin-left: 7px;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          font-weight: 700;
          font-style: normal;
          width: 22px;
          text-align: center;
          line-height: 22px;
          transition: all .2s ease;
          border-radius: 5px;
        }
      </style>
      <div class="wrapper" id="multiselect">
        <div class="tags">
          
          <input class="input-filter" type="text" tabindex="0" />
        </div>
        <div class="down-arrow"></div>
        <div class="content">
          <ul class="items">
          </ul>
        </div>
      </div>`;
  }
  connectedCallback () {
    this.template.innerHTML = this.htmlTemplate;
    const templateContent = this.template.content.cloneNode(true);
    this._content = templateContent.getElementById('multiselect');
    this._content.getElementsByClassName('input-filter')[0].onkeyup = this.updateFilteredList;
    this._content.getElementsByClassName('items')[0].onclick = this.addItem;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(templateContent);
  }
  updateFilteredList (e) {
    const items = this._content.getElementsByClassName('items')[0];
    this.filterList = this.list.filter(item => item.includes(e.target.value));
    items.innerHTML = '';
    this.filterList.forEach(item => {
      const li = document.createElement('li');
      li.innerText = item;
      items.appendChild(li);
    });
  }
  addItem (e) {
    this.tags = this._content.getElementsByClassName('tags')[0];
    const lastChild = this.tags.children[this.tags.childElementCount-1];
    const span = document.createElement('span');
    const italic = document.createElement('i');
    italic.onclick = this.removeItem;
    italic.classList.add('close-icon');
    italic.setAttribute("index", this.selectedItems.length-1);
    italic.innerText = 'X';
    span.innerHTML = 
      `<span>
        ${e.target.innerText}
      </span>`;
    span.appendChild(italic);
    span.classList.add('tag');
    this.tags.insertBefore(span, lastChild);
    this.selectedItems = [...this.selectedItems, e.target.innerText];
  }
  removeItem (e) {
    this.tags.removeChild(e.path[1]);
    this.selectedItems = this.selectedItems.splice(e.target.getAttribute('index'), 1);
  }
}

window.customElements.define('wc-multiselect', WcMultiselect);