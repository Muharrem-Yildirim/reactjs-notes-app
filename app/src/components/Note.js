import moment from "moment";
import React, { Component } from "react";
import { Card } from "react-bootstrap";
import * as utils from "../utils/utils";
import PropTypes from "prop-types";

export default class Note extends Component {
  constructor(props) {
    super(props);

    const { title, content, author, date, color, key } = this.props.note;

    this.state = {
      key: key,
      title: title || "",
      content: content || "",
      author: author || null,
      date: date || moment(),
      color: "#" + color || "",
      visible: true,
    };

    this.contentArea = React.createRef();

    this.updateDateTimer = null;
  }

  focusContent() {
    this.contentArea.current.focus();
  }

  componentDidMount() {
    utils.updateTextArea(this.contentArea.current);

    this.updateDateTimer = setInterval(() => {
      this.setState({});
    }, 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.updateDateTimer);
  }

  render() {
    return this.state.visible ? (
      <Card
        className="note"
        xl={3}
        lg={12}
        data-note-key={this.state.key}
        style={{ backgroundColor: this.state.color }}
      >
        <div className="top">
          <input
            className="title"
            type="text"
            value={this.state.title}
            placeholder="Untitled Note"
            onChange={(e) => {
              this.setState({ title: e.target.value, date: moment() }, () => {
                this.props.onNoteChanged(this.state.key, {
                  title: e.target.value,
                  content: this.state.content,
                  date: this.state.date,
                });
              });
            }}
            disabled={
              this.state.author != null
                ? this.state.author._id !==
                  utils.parseJwt(utils.getCookie("token"))._id
                  ? true
                  : false
                : true
            }
            style={{
              cursor:
                this.state.author != null
                  ? this.state.author._id ===
                    utils.parseJwt(utils.getCookie("token"))._id
                    ? ""
                    : "not-allowed"
                  : "not-allowed",
            }}
            spellCheck="false"
          ></input>
          <i
            className="fas fa-times delete-button"
            onClick={() => {
              let isMine =
                this.state.author != null
                  ? this.state.author._id ===
                    utils.parseJwt(utils.getCookie("token"))._id
                    ? true
                    : false
                  : false;

              if (isMine === true) {
                this.props.onNoteDelete(this.state.key).then(() => {
                  this.setState({ visible: false });
                });
              }
            }}
            style={{
              display:
                this.state.author != null
                  ? this.state.author._id ===
                    utils.parseJwt(utils.getCookie("token"))._id
                    ? ""
                    : "none"
                  : "none",
            }}
          ></i>
        </div>
        <textarea
          ref={this.contentArea}
          className="content"
          type="text"
          value={this.state.content}
          onChange={(e) => {
            utils.updateTextArea(e.target);

            this.setState({ content: e.target.value, date: moment() }, () => {
              this.props.onNoteChanged(this.state.key, {
                title: this.state.title,
                content: e.target.value,
                date: this.state.date,
              });
            });
          }}
          disabled={
            this.state.author != null
              ? this.state.author._id !==
                utils.parseJwt(utils.getCookie("token"))._id
                ? true
                : false
              : true
          }
          style={{
            cursor:
              this.state.author != null
                ? this.state.author._id ===
                  utils.parseJwt(utils.getCookie("token"))._id
                  ? ""
                  : "not-allowed"
                : "not-allowed",
          }}
          spellCheck="false"
        ></textarea>
        <div className="seperator"></div>
        <div className="bottom">
          <div>
            <i className="far fa-clock"></i> {moment(this.state.date).fromNow()}
          </div>
          {this.state.author != null && (
            <div>
              <i className="far fa-user"></i> {this.state.author.username}
            </div>
          )}
        </div>
      </Card>
    ) : (
      <div></div>
    );
  }
}

Note.propTypes = {
  note: PropTypes.object,
};
