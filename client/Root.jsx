import React from 'react';
import PouchDB from 'pouchdb';

const millis = () => new Date().getTime();

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msgs: [],
      db: new PouchDB('messages')
    };
  }

  componentDidMount() {
    const remoteDB = new PouchDB('http://localhost:5984/messages');
    this.state.db.sync(remoteDB, {
      live: true,
      retry: true
    }).on('change', (change) => {
      console.log('db sync change', change);
      this.updateAllDocs();
    }).on('paused', (info) => {
      console.log('db sync paused', info);
      this.updateAllDocs();
    }).on('active', (info) => {
      console.log('db sync active', info);
    }).on('error', (err) => {
      console.log('db sync error', err);
    });
  }

  updateAllDocs() {
    this.state.db.allDocs({ include_docs: true }).then((docs) => {
      this.setState({ msgs: docs.rows.map((val) => val.doc) });
    });
  }

  addComment() {
    const text = this.refs.text.value;
    if (!text) {
      console.log('no text entered');
      return;
    }
    console.log('entering comment', text);
    const time = millis();
    const doc = {
      _id: time.toString(),
      name: text,
      time
    };
    this.state.db.put(doc).then((info) => {
      console.log('put complete', info);
      this.refs.text.value = '';
      this.updateAllDocs();
    });
  }

  render() {
    const msgElements = this.state.msgs.map((comment) =>
      <h5 key={comment._id}>{comment.name}</h5>);
    return (<div>
      <input type="text" ref="text"
        onKeyPress={ (event) => event.key === 'Enter' ? this.addComment() : null }
      />
      <br />
      <button onClick={this.addComment}>Submit</button>
      {msgElements}
    </div>);
  }
}

export default Root;
