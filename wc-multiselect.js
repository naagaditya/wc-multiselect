class WcMultiselect extends HTMLElement{
  static get observedAttributes() {
    return ['label', 'options'];
  }
  constructor () {
    super();
    this.template = document.createElement('template');
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
          display: flex;
          align-items: center;
          flex-wrap: wrap;
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
        .content > ul {
          list-style: none;
          padding: 0;
          margin: 0;
          min-width: 100%;
          vertical-align: top;
        }
        .content > ul > li {
          padding: 0 12px;
          min-height: 40px;
          line-height: 16px;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        .content > ul > li:hover {
          background: #41b883;
          outline: none;
          color: #fff;
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
        .input-filter {
          font-size: 14px;
          padding: 4px 26px 9px 10px;
          border: none;
          outline: none;
          flex: 1;
          min-width: 150px;
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
  setProps () {
    this.list = JSON.parse(this.getAttribute('options'));
    this.label = this.getAttribute('label');
  }
  connectedCallback () {
    this.setProps();
    this.template.innerHTML = this.htmlTemplate;
    const templateContent = this.template.content.cloneNode(true);
    this._content = templateContent.getElementById('multiselect');
    this.filteredContent = this._content.getElementsByClassName('content')[0];
    this.filteredContent.style.display = 'none';
    this.input = this._content.getElementsByClassName('input-filter')[0];
    this.input.onkeyup = this.updateFilteredList;
    this.input.onkeydown = (e) => {
      if (e.key == 'Backspace' && e.target.value == '') {
        this.removeLastItem();
      }
    };
    this._content.getElementsByClassName('items')[0].onclick = this.addItem;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(templateContent);
  }
  updateFilteredList (e) {
    if (!this._content) {
      return;
    }
    this.filteredContent.style.display = 'block';
    const items = this._content.getElementsByClassName('items')[0];
    this.filterList = this.list.filter(item => {
      const itemLabel = item[this.label] ? item[this.label] : item;
      return itemLabel.toString().includes(e ? e.target.value : '');
    });
    items.innerHTML = '';
    this.filterList.forEach((item, index) => {
      const itemLabel = item[this.label] ? item[this.label] : item;
      const li = document.createElement('li');
      li.setAttribute('filtered-list-index', index);
      li.innerText = itemLabel;
      items.appendChild(li);
    });
  }
  addItem (e) {
    const filteredListIndex = parseInt(e.target.getAttribute('filtered-list-index'));
    const isAlreadySelected  = this.selectedItems.filter(item => item == this.filterList[filteredListIndex]).length > 0;
    if (isAlreadySelected) {
      return;
    }
    this.filteredContent.style.display = 'none';
    this.input.value = '';
    this.tags = this._content.getElementsByClassName('tags')[0];
    const lastChild = this.tags.children[this.tags.childElementCount-1];
    const span = document.createElement('span');
    const italic = document.createElement('i');
    italic.onclick = this.removeItem;
    italic.classList.add('close-icon');
    italic.innerHTML = '&times;';
    span.innerHTML = 
      `<span>
        ${e.target.innerText}
      </span>`;
    span.appendChild(italic);
    span.classList.add('tag');
    this.tags.insertBefore(span, lastChild);
    this.selectedItems = [...this.selectedItems, this.filterList[filteredListIndex]];

    this.dispatchEvent(new CustomEvent('add-item', {
      detail: { selectedItems: this.selectedItems },
      bubbles: true
    }));
  }
  removeItem (e) {
    const itemToRemove = e.target.parentElement;
    const listedItems = Object.values(e.target.parentElement.parentElement.children);
    this.tags.removeChild(itemToRemove);
    this.selectedItems.splice(listedItems.indexOf(itemToRemove), 1);
    this.dispatchEvent(new CustomEvent('remove-item', {
      detail: { selectedItems: this.selectedItems },
      bubbles: true
    }));
  }
  removeLastItem () {
    if (this.tags) {
      // last child is input box we want to remove last tag which is before input
      const lastTag = this.tags.children[this.tags.childElementCount - 2];
      this.tags.removeChild(lastTag);
      this.selectedItems.splice(this.selectedItems.length-1, 1);
      this.dispatchEvent(new CustomEvent('remove-item', {
        detail: { selectedItems: this.selectedItems },
        bubbles: true
      }));
    }
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal != newVal) {
      this.setProps();
      this.updateFilteredList();
    }
  }
}

window.customElements.define('wc-multiselect', WcMultiselect);