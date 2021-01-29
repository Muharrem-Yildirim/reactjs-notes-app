/*

TO-DO: 

fix update function 

*/

import React, { Component } from "react";
import { Container, CardColumns, Button, Row, Col } from "react-bootstrap";
import Note from "../components/Note";
import moment from "moment";
import axios from "axios";
import * as utils from "../utils/utils";
import { withToastManager } from "react-toast-notifications";

const ErrorBox = (error) => {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        fontWeight: "bold",
        color: "red",
      }}
      className="mt-4"
    >
      Error: <span style={{ color: "black" }}>{error}</span>
    </div>
  );
};

const LoadingBox = () => {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        fontWeight: "bold",
      }}
      className="mt-4"
    >
      Loading...
    </div>
  );
};

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [],
      loaded: false,
      error: null,
      changedNotes: [],
    };

    this.noteElements = [];

    this.syncTimer = [];
  }

  handleLeavePage = (e) => {
    if (this.state.changedNotes.length > 0) {
      e.returnValue = "If you confirm, you will lost unsaved changes."; // Gecko, Trident, Chrome 34+
      return e.returnValue; // Gecko, WebKit, Chrome <34
    }
  };

  getData = async () => {
    return new Promise((resolve, reject) => {
      this.noteElements = [];

      axios
        .get(`${utils.getAPIUrl()}/notes`, {
          headers: {
            Authorization: "Bearer " + utils.getCookie("token"),
          },
        })
        .then((response) => {
          this.setState({ notes: response.data, loaded: true }, () => {
            resolve();
          });
        })
        .catch((error) => {
          let errMsg =
            error.response?.data?.message == null
              ? error.response?.data == null
                ? error.message
                : error.response.data
              : error.response.data.message;

          this.setState({ error: errMsg });

          this.handleAPIError("An error occurred while fetching data.", error);

          if (error.response)
            if (error.response.status === 401) this.redirectToLogin(true);

          reject(error);
        });
    });
  };

  redirectToLogin(is401) {
    if (is401) {
      this.props.toastManager.add(`Your session has expired please re-login.`, {
        appearance: "error",
        autoDismiss: true,
      });
    } else {
      utils.logout();
      this.props.history.push("/login");
    }
  }

  componentDidMount() {
    if (utils.getCookie("token") == null) {
      this.redirectToLogin();
      return;
    }

    this.getData();

    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = setInterval(this.syncNotes, 10 * 1000);

    window.addEventListener("beforeunload", this.handleLeavePage);
  }

  componentWillUnmount() {
    if (this.syncTimer) clearInterval(this.syncTimer);

    window.removeEventListener("beforeunload", this.handleLeavePage);
  }

  handleAPIError(notificationMessage, error) {
    let errMsg =
      error.response?.data?.message == null
        ? error.response?.data == null
          ? error.message
          : error.response.data
        : error.response.data.message;

    this.props.toastManager.add(`${notificationMessage} (${errMsg})`, {
      appearance: "error",
      autoDismiss: true,
    });
  }

  syncNotes = () => {
    new Promise((resolve, reject) => {
      let syncedNotes = 0;
      let unsyncedNotes = 0;

      this.state.changedNotes
        .filter((note) => note.data.synced === false)
        .forEach(async (note, key) => {
          axios
            .patch(`${utils.getAPIUrl()}/notes/${note.id}`, note.data, {
              headers: {
                Authorization: "Bearer " + utils.getCookie("token"),
              },
            })
            .then(() => {
              note.data.synced = true;
              syncedNotes++;

              if (key === this.state.changedNotes.length - 1)
                resolve({ syncedNotes, unsyncedNotes });
            })
            .catch((error) => {
              note.data.error = true;

              unsyncedNotes++;

              if (error.response)
                if (error.response.status === 401) this.redirectToLogin(true);
                else if (error.response.status === 403) {
                  if (key === this.state.changedNotes.length - 1)
                    reject({ syncedNotes, unsyncedNotes });
                }
            });
        });
    })
      .then(({ syncedNotes, unsyncedNotes }) => {
        this.notifySync(syncedNotes, unsyncedNotes);
      })
      .catch(({ syncedNotes, unsyncedNotes }) => {
        this.notifySync(syncedNotes, unsyncedNotes);
      });
  };

  notifySync(syncedNotes, unsyncedNotes) {
    if (syncedNotes > 0) {
      this.setState((prevState) => {
        return {
          changedNotes: prevState.changedNotes.filter((note) => {
            return note.data.error === true;
          }),
        };
      });

      this.getData().then(() => {
        this.props.toastManager.add(
          `All changed notes successfully synced. (${syncedNotes} notes)`,
          {
            appearance: "success",
            autoDismiss: true,
          }
        );
      });
    }

    if (unsyncedNotes > 0) {
      this.props.toastManager.add(`${unsyncedNotes} notes couldn't synced.`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }

  addNewNote() {
    axios
      .post(
        `${utils.getAPIUrl()}/notes`,
        {
          title: "Untitled Note",
          content: "",
          color: utils.rgba2hex(
            `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
              Math.random() * 255
            )},${Math.floor(Math.random() * 255)},0.3)`
          ),
          date: moment(),
        },
        {
          headers: {
            Authorization: "Bearer " + utils.getCookie("token"),
          },
        }
      )
      .then(() => {
        this.getData().then(() => {
          if (this.noteElements.length > 0) {
            let lastNote = document.querySelector(
              'div[data-note-key="' +
                this.state.notes[this.state.notes.length - 1]._id +
                '"]'
            );
            if (lastNote) lastNote.scrollIntoView();
            if (this.noteElements[this.noteElements.length - 1] != null)
              this.noteElements[this.noteElements.length - 1].focusContent();
          }
        });

        this.props.toastManager.add("Note successfully added.", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((error) => {
        this.handleAPIError("An error occurred while adding new note.", error);

        if (error.response.status === 401) this.redirectToLogin(true);
      });
  }

  onNoteChanged(id, data) {
    // if (this.syncTimer) clearInterval(this.syncTimer);

    data.color = utils.rgba2hex(
      window
        .getComputedStyle(
          document.querySelector('div[data-note-key="' + id + ""),
          null
        )
        .getPropertyValue("background-color")
    );

    let note = this.state.changedNotes.filter((note, key) => note.id === id);

    if (note.length === 0)
      this.setState((prevState) => {
        return {
          changedNotes: [
            ...prevState.changedNotes,
            {
              id: id,
              data: { ...data, synced: false },
            },
          ],
        };
      });
    else {
      note.forEach((note) => {
        this.setState((prevState) => {
          let newState = prevState.changedNotes
            .filter((element) => element.id === note.id)
            .forEach((note) => {
              note.data = { ...data, synced: false };
            });

          return {
            newState,
          };
        });
      });
    }

    // this.syncTimer = setInterval(this.syncNotes, 1000);
  }

  onNoteDelete(id) {
    return new Promise((resolve, reject) => {
      axios
        .delete(`${utils.getAPIUrl()}/notes/${id}`, {
          headers: {
            Authorization: "Bearer " + utils.getCookie("token"),
          },
        })
        .then(() => {
          this.getData().then(() => {
            this.props.toastManager.add("Note successfully deleted.", {
              appearance: "success",
              autoDismiss: true,
            });
          });
        })
        .catch((error) => {
          this.handleAPIError("An error occurred while deleting note.", error);

          if (error.response)
            if (error.response.data.error === 401) this.redirectToLogin(true);
        });
    });
  }

  render() {
    return (
      <Container className="mt-4">
        <Row>
          <Col>
            {this.state.error == null && this.state.loaded && (
              <Container className="top-controls">
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    this.addNewNote();
                  }}
                >
                  Add
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    this.props.toastManager.add(
                      "Fetching data, Please wait..",
                      {
                        appearance: "info",
                        autoDismiss: true,
                      }
                    );

                    console.log(utils.getAPIUrl());

                    this.setState({ loaded: false, changedNotes: [] }, () => {
                      this.getData().then(() => {
                        this.props.toastManager.add(
                          "Data successfully fetched.",
                          {
                            appearance: "success",
                            autoDismiss: true,
                          }
                        );
                      });
                    });
                  }}
                  style={{ marginLeft: 10 }}
                  disabled={this.state.changedNotes.length === 0 ? false : true}
                >
                  Refresh
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    this.syncNotes();
                  }}
                  style={{ marginLeft: 10 }}
                  disabled={this.state.changedNotes.length === 0 ? true : false}
                >
                  Save
                </Button>
              </Container>
            )}

            {this.state.error == null ? (
              this.state.loaded ? (
                this.state.notes.length !== 0 ? (
                  <CardColumns className="notes mt-4 mb-4">
                    {this.state.notes.map((note, i) => {
                      return (
                        <Note
                          note={{ ...note, key: note._id }}
                          key={note._id}
                          ref={(element) => (this.noteElements[i] = element)}
                          onNoteChanged={this.onNoteChanged.bind(this)}
                          onNoteDelete={this.onNoteDelete.bind(this)}
                        />
                      );
                    })}
                  </CardColumns>
                ) : (
                  ErrorBox("No notes found.")
                )
              ) : (
                <LoadingBox />
              )
            ) : (
              ErrorBox(this.state.error)
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withToastManager(Main);
