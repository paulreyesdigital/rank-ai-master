"use-strict";
require("electron-reload")(__dirname);

const { ipcMain } = require("electron");
const electron = require("electron");
const { app, BrowserWindow, Menu, shell } = electron;
const path = require("path");

const docx = require("docx");
const { Document, Packer, Paragraph, HeadingLevel } = docx;
const fs = require("fs");

const { Builder, By, Key, until, WebDriver } = require("selenium-webdriver");

const firebase = require("./firebase");
const { SectionType } = require("docx");
const firedb = firebase.database();

global.sharedObj = {
  user: null,
  blogArticleTasks: [],
};

let MAIN_WINDOW;
Menu.setApplicationMenu(null);

app.on("ready", () => {
  let loginForm = new BrowserWindow({
    width: 500,
    height: 800,
    resizable: false,
    backgroundColor: "#363636",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  loginForm.loadURL(path.join("file://", __dirname, "views/login-form.html"));

  loginForm.on("closed", () => {
    loginForm = null;
  });
});

ipcMain.on("user-login", (evt, data) => {
  firedb
    .ref("users")
    .orderByChild("username")
    .equalTo(data.username)
    .limitToFirst(1)
    .once("value")
    .then((snapshot) => {
      if (snapshot.numChildren() > 0) {
        snapshot.forEach((user) => {
          if (user.val().password === data.password) {
            if (user.val().active)
              return evt.reply("access-denied", "User already logged in.");

            firedb
              .ref(`users/${user.val().key}`)
              .update({
                active: true,
              })
              .then(() => {
                sharedObj.user = user.val();
                evt.reply("access-granted", true);

                MAIN_WINDOW = new BrowserWindow({
                  width: 500,
                  height: 800,
                  resizable: false,
                  backgroundColor: "#363636",
                  webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                  },
                });

                MAIN_WINDOW.loadURL(
                  path.join("file://", __dirname, "views/main-menu.html")
                );

                MAIN_WINDOW.on("closed", () => {
                  /* TODO LOGOUT USER */
                  firedb
                    .ref(`users/${user.val().key}`)
                    .update({
                      active: false,
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                });
              })
              .catch((err) => {
                console.log(err);
                evt.reply("access-denied", "Login failed.");
              });
          } else {
            /* INCORRECT PASSWORD */
            evt.reply("access-denied", "Incorrect username or password.");
          }
        });
      } else {
        /* COULD NOT FIND USER */
        evt.reply("access-denied", "Incorrect username or password.");
      }
    });
});

ipcMain.on("my-account-form-submit", (evt, data) => {
  firedb
    .ref(`users/${sharedObj.user.key}`)
    .update(data)
    .then(() => {
      /* DATA SAVED SUCCESSFULLY */
      evt.reply("my-account-data-reply", true);
    })
    .catch((err) => {
      /* DATA FAILED TO SAVE */
      console.log(err);
      evt.reply("my-account-data-reply", false);
    });
});

ipcMain.on("nav-blogarticle", () => {
  MAIN_WINDOW.loadURL(
    path.join("file://", __dirname, "views/blog-article.html")
  );
});

ipcMain.on("nav-mainmenu", () => {
  MAIN_WINDOW.loadURL(path.join("file://", __dirname, "views/main-menu.html"));
});

ipcMain.on("nav-login", () => {
  let loginForm = new BrowserWindow({
    width: 500,
    height: 800,
    resizable: false,
    backgroundColor: "#363636",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  loginForm.loadURL(path.join("file://", __dirname, "views/login-form.html"));

  loginForm.on("closed", () => {
    loginForm = null;
  });
});

/* SAVING FILE DOCX */

const CONTENT = {
  title: "Sample Title",
  introPar:
    "Anim Lorem do quis ex adipisicing ex veniam commodo sint et quis cillum. Sint adipisicing commodo nostrud do ut. Est ut id aliquip mollit velit consectetur enim. Ea commodo consectetur non cupidatat dolore minim non laborum nulla pariatur laborum non enim. Adipisicing aliquip occaecat Lorem velit enim et elit nostrud duis.",
    sections: [
    {
      header: "h2 #1",
      par: [
        "content 1 Cupidatat culpa consequat adipisicing tempor deserunt pariatur duis commodo culpa do id. Veniam minim culpa dolor culpa consequat. Eu aliquip aliqua excepteur quis eiusmod elit adipisicing tempor commodo ullamco. Voluptate ullamco cillum do dolore sunt incididunt ipsum sunt proident culpa pariatur voluptate et. Sit minim sunt anim laborum aute ullamco ipsum.",
        "Et enim reprehenderit sit ipsum. Voluptate non non consectetur sit ea non velit. Ullamco amet amet adipisicing ullamco laboris. Elit sit occaecat anim ea. Cillum eiusmod ad eu veniam nulla et elit ullamco sit do reprehenderit id ut. Incididunt amet sint id consectetur proident ea minim. Sint ut non in ea sint.",
      ],
    },
    {
      header: "h2 #2",
      par: [
        "content 2 Cupidatat culpa consequat adipisicing tempor deserunt pariatur duis commodo culpa do id. Veniam minim culpa dolor culpa consequat. Eu aliquip aliqua excepteur quis eiusmod elit adipisicing tempor commodo ullamco. Voluptate ullamco cillum do dolore sunt incididunt ipsum sunt proident culpa pariatur voluptate et. Sit minim sunt anim laborum aute ullamco ipsum.",
        "Et enim reprehenderit sit ipsum. Voluptate non non consectetur sit ea non velit. Ullamco amet amet adipisicing ullamco laboris. Elit sit occaecat anim ea. Cillum eiusmod ad eu veniam nulla et elit ullamco sit do reprehenderit id ut. Incididunt amet sint id consectetur proident ea minim. Sint ut non in ea sint.",
      ],
    },
    {
      header: "h2 #3",
      par: [
        "content 3 Cupidatat culpa consequat adipisicing tempor deserunt pariatur duis commodo culpa do id. Veniam minim culpa dolor culpa consequat. Eu aliquip aliqua excepteur quis eiusmod elit adipisicing tempor commodo ullamco. Voluptate ullamco cillum do dolore sunt incididunt ipsum sunt proident culpa pariatur voluptate et. Sit minim sunt anim laborum aute ullamco ipsum.",
        "Et enim reprehenderit sit ipsum. Voluptate non non consectetur sit ea non velit. Ullamco amet amet adipisicing ullamco laboris. Elit sit occaecat anim ea. Cillum eiusmod ad eu veniam nulla et elit ullamco sit do reprehenderit id ut. Incididunt amet sint id consectetur proident ea minim. Sint ut non in ea sint.",
      ],
    },
    {
      header: "h2 #4",
      par: [
        "content 4 Cupidatat culpa consequat adipisicing tempor deserunt pariatur duis commodo culpa do id. Veniam minim culpa dolor culpa consequat. Eu aliquip aliqua excepteur quis eiusmod elit adipisicing tempor commodo ullamco. Voluptate ullamco cillum do dolore sunt incididunt ipsum sunt proident culpa pariatur voluptate et. Sit minim sunt anim laborum aute ullamco ipsum.",
        "Et enim reprehenderit sit ipsum. Voluptate non non consectetur sit ea non velit. Ullamco amet amet adipisicing ullamco laboris. Elit sit occaecat anim ea. Cillum eiusmod ad eu veniam nulla et elit ullamco sit do reprehenderit id ut. Incididunt amet sint id consectetur proident ea minim. Sint ut non in ea sint.",
      ],
    },
    {
      header: "h2 #5",
      par: [
        "content 5 Cupidatat culpa consequat adipisicing tempor deserunt pariatur duis commodo culpa do id. Veniam minim culpa dolor culpa consequat. Eu aliquip aliqua excepteur quis eiusmod elit adipisicing tempor commodo ullamco. Voluptate ullamco cillum do dolore sunt incididunt ipsum sunt proident culpa pariatur voluptate et. Sit minim sunt anim laborum aute ullamco ipsum.",
        "Et enim reprehenderit sit ipsum. Voluptate non non consectetur sit ea non velit. Ullamco amet amet adipisicing ullamco laboris. Elit sit occaecat anim ea. Cillum eiusmod ad eu veniam nulla et elit ullamco sit do reprehenderit id ut. Incididunt amet sint id consectetur proident ea minim. Sint ut non in ea sint.",
      ],
    },
  ],
};
// const DEST_PATH = 'D:/Files_01/Projects/Electron Apps/Rank Ai/destination_folder'

// const filePath = createDoc('Roofig Contractor',CONTENT)
// console.log(filePath)

// open file
// shell.openItem(FILE_PATH)

function createDoc(fileName, content) {
  let sections = [
    {
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          text: content.title,
          heading: HeadingLevel.HEADING_1,
          spacing: {
            after: 200,
            before: 200,
          },
        }),
        new Paragraph({
          text: content.introPar,
          style: "p",
          spacing: {
            after: 100,
          },
        }),
      ],
    },
  ];

  content.sections.forEach((section) => {
    sections[0].children.push(
      new Paragraph({
        text: section.header,
        heading: HeadingLevel.HEADING_2,
        spacing: {
          after: 200,
          before: 200,
        },
      })
    );

    section.par.forEach((p) => {
      sections[0].children.push(
        new Paragraph({
          text: p,
          spacing: {
            after: 100,
          },
          style: "p",
        })
      );
    });
  });

  const doc = new Document({
    sections,
    styles: {
      default: {
        heading1: {
          run: {
            size: 42,
            font: "Calibri",
          },
        },
        heading2: {
          run: {
            size: 26,
            font: "Calibri",
          },
        },
      },
      paragraphStyles: [
        {
          id: "p",
          name: "Par",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Calibri",
          },
        },
      ],
    },
  });

  // Used to export the file into a .docx file
  const path = `${des}\\${fileName}.docx`;
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path, buffer);
  });

  return path;
}

/* -------------------------------------------------------------------------------------------- */

ipcMain.on("run-blog-article-task", (evt, data) => {
  const USER_INSTANCE = {
    task_id: data.task_id,
    username: sharedObj.user.conversion_username,
    password: sharedObj.user.conversion_password,
    description: data.description,
    keywords: data.keywords,
    wordCountLimit: Number(data.wordCountLimit),
  };

  console.log(USER_INSTANCE);

  try {
    (async function () {
      await startNewAutomateInstance(USER_INSTANCE);
      console.log("DONE");
      // evt.reply('blog-article-task-ready', USER_INSTANCE)
    })();
  } catch (err) {
    console.log(err);
    evt.reply("blog-article-task-failed", USER_INSTANCE);
  }
});

/* PAUL'S CODE BELOW */

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

const loginUserModule = (driver) => {
  async function inputUsername(username) {
    const emailElement = By.id("email");
    await driver.findElement(emailElement).sendKeys(username);
  }
  async function inputPassword(password) {
    const passwordElement = By.id("password");
    await driver.findElement(passwordElement).sendKeys(password);
  }
  async function proceedLogin() {
    const loginButton = By.xpath(
      `//*[@id="app"]/div[1]/div/div/div[3]/div/form/div[4]/span/button`
    );
    await driver.findElement(loginButton).click();
  }
  async function redirectToLongFormAssistant() {
    const homeHeader = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div[5]/div/div[1]/h2`
    );
    await driver.wait(until.elementLocated(homeHeader), 20000);
    await driver.get("https://app.conversion.ai/workflows/setup");
  }
  return {
    inputUsername: inputUsername,
    inputPassword: inputPassword,
    proceedLogin: proceedLogin,
    redirectToLongFormAssistant: redirectToLongFormAssistant,
  };
};

const longFormAssistantModule = (driver) => {
  const stepOne = (driver) => {
    async function inputDescription(description) {
      // input describe topic
      await sleep(5000);
      let descriptionElement = By.id("topic");
      await driver.wait(until.elementLocated(descriptionElement), 20000);
      await driver
        .findElement(descriptionElement)
        .sendKeys(description, Key.RETURN);
      await sleep(5000);
    }
    async function inputKeywords(keywords) {
      // input keywords
      for (let i = 0; i < keywords.length; i++) {
        const keywordsElement = By.xpath(
          '//*[@id="keywordInput"]/div/ul/li/input'
        );
        await driver
          .findElement(keywordsElement)
          .sendKeys(keywords[i], Key.RETURN);
        await sleep(500);
      }
    }
    async function saveInput() {
      // save input
      const stepOneSaveButton = By.xpath(
        `//*[@id="step-1"]/div[2]/div[6]/button`
      );
      await driver.findElement(stepOneSaveButton).click();
    }
    return {
      inputDescription: inputDescription,
      inputKeywords: inputKeywords,
      saveInput: saveInput,
    };
  };
  const stepTwo = (driver) => {
    async function inputTitle(description) {
      await sleep(5000);
      // input title
      const headlineElement = By.xpath(
        `//*[@id="step-2"]/div/div[2]/div[3]/div/form[1]/input`
      );
      await driver.findElement(headlineElement).sendKeys(description);
    }
    async function clickGenerate() {
      // click generate
      await sleep(5000);
      const generateTitleButton = By.xpath(
        `//*[@id="step-2"]/div/div[2]/div[3]/button`
      );
      await driver.findElement(generateTitleButton).click();
    }
    async function waitForGenerateToFinish(driver) {
      // wait for generate to complete
      const newFormTitleElement = By.xpath(
        `//*[@id="step-2"]/div/div[2]/div[3]/div/form[2]`
      );
      await driver.wait(until.elementLocated(newFormTitleElement), 20000);
    }
    async function saveTitle() {
      // save title
      const useThisTitleButton = By.xpath(
        `//*[@id="step-2"]/div/div[2]/div[3]/div/form[2]/div/button`
      );
      await driver.findElement(useThisTitleButton).click();
    }
    return {
      inputTitle: inputTitle,
      clickGenerate: clickGenerate,
      waitForGenerateToFinish: waitForGenerateToFinish,
      saveTitle: saveTitle,
    };
  };
  const stepThree = (driver) => {
    async function inputIntro(description) {
      await sleep(5000);

      // input intro
      const introElement = By.xpath(
        `//*[@id="step-3"]/div/div[2]/div[3]/div/form/textarea`
      );
      await driver.findElement(introElement).sendKeys(description);
      await sleep(5000);
    }
    async function clickGenerate() {
      // click generate
      await sleep(5000);
      const generateIntroButton = By.xpath(
        `//*[@id="step-3"]/div/div[2]/div[3]/button`
      );
      await driver.findElement(generateIntroButton).click();
    }
    async function waitForGenerateToFinish(driver) {
      // wait for generate to complete
      const newFormIntroElement = By.xpath(
        `//*[@id="step-3"]/div/div[2]/div[3]/div/form[2]/textarea`
      );
      await driver.wait(until.elementLocated(newFormIntroElement), 20000);
    }
    async function saveIntro() {
      // save Intro
      const useThisIntroButton = By.xpath(
        `//*[@id="step-3"]/div/div[2]/div[3]/div/form[2]/div/button`
      );
      await sleep(5000);
      await driver.findElement(useThisIntroButton).click();
    }
    return {
      inputIntro: inputIntro,
      clickGenerate: clickGenerate,
      waitForGenerateToFinish: waitForGenerateToFinish,
      saveIntro: saveIntro,
    };
  };
  const stepFour = (driver) => {
    async function saveLongForm() {
      await sleep(5000);
      const openEditorButton = By.xpath(`//*[@id="step-4"]/div[2]/button`);
      await driver.findElement(openEditorButton).click();
    }
    return {
      saveLongForm: saveLongForm,
    };
  };
  return {
    stepOne: stepOne,
    stepTwo: stepTwo,
    stepThree: stepThree,
    stepFour: stepFour,
  };
};

const document = (driver) => {
  async function checkIfEditorIsReady() {
    await sleep(5000);
    // wait for editor to be ready
    const documentEditorElement = By.xpath(`//*[@id="docEditor"]/div[1]`);
    await driver.wait(until.elementLocated(documentEditorElement), 20000);
    await sleep(300);
  }
  async function copyTitleOfDocument() {
    // copy title
    const titleElement = By.id(`title`);
    await driver
      .findElement(titleElement)
      .sendKeys(Key.chord(Key.CONTROL, "a"));
    await sleep(300);
    await driver
      .findElement(titleElement)
      .sendKeys(Key.chord(Key.CONTROL, "c"));
    await sleep(300);
  }
  async function enterSpacingForHeadline() {
    // Enter space for Header
    const firstP = By.xpath(`//*[@id="docEditor"]/div[1]/p[1]`);
    await driver.findElement(firstP).sendKeys(Key.chord(Key.CONTROL, Key.HOME));
    await sleep(300);
    await driver.findElement(firstP).sendKeys(Key.RETURN);
    await sleep(300);
    await driver.findElement(firstP).sendKeys(Key.chord(Key.CONTROL, Key.HOME));
    await sleep(300);
    await driver.findElement(firstP).sendKeys(Key.chord(Key.CONTROL, "v"));
    await sleep(300);
    await driver.findElement(firstP).sendKeys(Key.chord(Key.SHIFT, Key.HOME));
    await sleep(300);
  }
  async function convertTextIntoHeader() {
    // Convert Headline into header tag
    const H1Button = By.xpath(`//*[@id="toolbar"]/button[1]`);
    await sleep(300);
    await driver.findElement(H1Button).click();
    await sleep(300);
  }
  async function openPowerMode() {
    const powerModeButton = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[1]/div[2]/div/span/button[2]`
    );
    await sleep(5000);
    await driver.findElement(powerModeButton).click();
    await sleep(5000);
  }
  async function waitForPowerModeToFullyLoad() {
    const blogOutlineButton = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[1]/div/div/button[6]`
    );
    await driver.wait(until.elementLocated(blogOutlineButton), 20000);
  }
  return {
    checkIfEditorIsReady: checkIfEditorIsReady,
    copyTitleOfDocument: copyTitleOfDocument,
    enterSpacingForHeadline: enterSpacingForHeadline,
    convertTextIntoHeader: convertTextIntoHeader,
    openPowerMode: openPowerMode,
    waitForPowerModeToFullyLoad: waitForPowerModeToFullyLoad,
  };
};

const createBlogPostOutlineModule = (driver) => {
  async function openBlogPostEditor() {
    await sleep(5000);
    const blogOutlineButton = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[1]/div/div/button[6]`
    );
    await driver.findElement(blogOutlineButton).click();
  }
  async function waitForBlogPostEditorToLoad() {
    await sleep(5000);
    const blogOutlineTitle = By.xpath(`//*[@id="title"]`);
    await sleep(5000);
    await driver.wait(until.elementLocated(blogOutlineTitle), 20000);
  }
  async function deletePreviousTitle() {
    await sleep(5000);
    const blogOutlineTitle = By.xpath(`//*[@id="title"]`);
    await driver
      .findElement(blogOutlineTitle)
      .sendKeys(Key.chord(Key.CONTROL, "a"));
    await sleep(5000);
    await driver.findElement(blogOutlineTitle).sendKeys(Key.DELETE);
  }
  async function setTitle() {
    const titleContent = driver
      .findElement(By.xpath(`//*[@id="docEditor"]/div[1]/h1`))
      .getText();
    const blogOutlineTitle = By.xpath(`//*[@id="title"]`);
    await sleep(5000);
    await driver.findElement(blogOutlineTitle).sendKeys(titleContent);
  }
  async function setToneOfVoice() {
    // delete any existing tone of voice
    await driver.findElement(By.xpath(`//*[@id="tone"]`)).click();
    await sleep(500);
    await driver
      .findElement(By.xpath(`//*[@id="tone"]`))
      .sendKeys(Key.chord(Key.CONTROL, "a"));
    await sleep(500);
    await driver.findElement(By.xpath(`//*[@id="tone"]`)).sendKeys(Key.DELETE);

    // input tone of voice
    await sleep(500);
    await driver
      .findElement(By.xpath(`//*[@id="tone"]`))
      .sendKeys("Informative"); // change with argument
    await sleep(500);
  }
  async function generateOutline() {
    await sleep(3000);
    const generateOutlineButton = By.xpath(
      `/html/body/div[1]/div/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/form/div[2]/div[2]/button`
    );
    await sleep(5000);
    await driver.findElement(generateOutlineButton).click();
  }
  async function waitForGenerateToFinish(driver) {
    await sleep(10000);
    const previousOutlineContentXPath = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/pre`
    );
    const previousOutlineContentText = driver
      .findElement(previousOutlineContentXPath)
      .getText();

    while (previousOutlineContentText) {
      await sleep(5000);
      console.log("Waiting for Generating..");
      if (
        driver
          .findElement(
            By.xpath(
              `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/pre`
            )
          )
          .getText() !== previousOutlineContentText
      ) {
        console.log("Successfully Generated");
        break;
      }
    }
  }
  async function copyGeneratedOutline() {
    await sleep(5000);
    const copyBlogPostOutlineButton = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/div/div[2]/button[2]`
    );
    await sleep(5000);
    await driver.findElement(copyBlogPostOutlineButton).click();
  }
  async function saveOutlineIntoArray() {
    await sleep(5000);
    const generatedOutlineContent = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/pre`
    );
    const text = await driver.findElement(generatedOutlineContent).getText();
    const outlineArray = convertNumberedStringToArray(text);
    return outlineArray;
  }
  return {
    openBlogPostEditor: openBlogPostEditor,
    waitForBlogPostEditorToLoad: waitForBlogPostEditorToLoad,
    deletePreviousTitle: deletePreviousTitle,
    setTitle: setTitle,
    setToneOfVoice: setToneOfVoice,
    generateOutline: generateOutline,
    waitForGenerateToFinish: waitForGenerateToFinish,
    copyGeneratedOutline: copyGeneratedOutline,
    saveOutlineIntoArray: saveOutlineIntoArray,
  };
};

async function loginUser(driver, username, password) {
  await loginUserModule(driver)
    .inputUsername(username)
    .catch((err) => handleError(driver, err));
  await loginUserModule(driver)
    .inputPassword(password)
    .catch((err) => handleError(driver, err));
  await loginUserModule(driver)
    .proceedLogin()
    .catch((err) => handleError(driver, err));
  await loginUserModule(driver)
    .redirectToLongFormAssistant()
    .catch((err) => handleError(driver, err));
}
async function stepOne(driver, description, keywords) {
  await longFormAssistantModule(driver)
    .stepOne(driver)
    .inputDescription(description)
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepOne(driver)
    .inputKeywords(keywords)
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepOne(driver)
    .saveInput()
    .catch((err) => handleError(driver, err));
}
async function stepTwo(driver, description) {
  await longFormAssistantModule(driver)
    .stepTwo(driver)
    .inputTitle(description)
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepTwo(driver)
    .clickGenerate()
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepTwo(driver)
    .waitForGenerateToFinish(driver)
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepTwo(driver)
    .saveTitle()
    .catch((err) => handleError(driver, err));
}
async function stepThree(driver, description) {
  await longFormAssistantModule(driver)
    .stepThree(driver)
    .inputIntro(description)
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepThree(driver)
    .clickGenerate()
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepThree(driver)
    .waitForGenerateToFinish(driver)
    .catch((err) => handleError(driver, err));
  await longFormAssistantModule(driver)
    .stepThree(driver)
    .saveIntro()
    .catch((err) => handleError(driver, err));
}
async function stepFour(driver) {
  await longFormAssistantModule(driver).stepFour(driver).saveLongForm();
}
async function createHeadline(driver) {
  // First Process Preparing Headline
  await document(driver)
    .checkIfEditorIsReady()
    .catch((err) => handleError(driver, err));
  await document(driver)
    .copyTitleOfDocument()
    .catch((err) => handleError(driver, err));
  await document(driver)
    .enterSpacingForHeadline()
    .catch((err) => handleError(driver, err));
  await document(driver)
    .convertTextIntoHeader()
    .catch((err) => handleError(driver, err));
}
async function setDocumentToPowerMode(driver) {
  await document(driver)
    .openPowerMode()
    .catch((err) => handleError(driver, err));
  await document(driver)
    .waitForPowerModeToFullyLoad()
    .catch((err) => handleError(driver, err));
}
async function createBlogPostOutline(driver) {
  await createBlogPostOutlineModule(driver)
    .openBlogPostEditor()
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .waitForBlogPostEditorToLoad()
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .deletePreviousTitle()
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .setTitle()
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .setToneOfVoice()
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .generateOutline()
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .waitForGenerateToFinish(driver)
    .catch((err) => handleError(driver, err));
  await createBlogPostOutlineModule(driver)
    .copyGeneratedOutline()
    .catch((err) => handleError(driver, err));
}
async function handleError(driver, err) {
  console.error(err);
  await driver.close();
}

// General FUNCTIONS
function sleep(ms) {
  return new Promise((accept) => {
    setTimeout(() => {
      accept();
    }, ms);
  });
}

function convertNumberedStringToArray(string) {
  return string
    .split(/(?=\d+)/)
    .map((item) => item.slice(0, -1).slice(3, item.length));
}
async function waitForGenerateToFinish(driver) {
  await sleep(10000);
  const previousOutlineContentXPath = By.xpath(
    `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/pre`
  );
  const previousOutlineContentText = driver
    .findElement(previousOutlineContentXPath)
    .getText();

  while (previousOutlineContentText) {
    await sleep(5000);
    console.log("Waiting for Generating..");
    if (
      driver
        .findElement(
          By.xpath(
            `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/pre`
          )
        )
        .getText() !== previousOutlineContentText
    ) {
      console.log("Successfully Generated");
      break;
    }
  }
}

// FILTER METHODS
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

async function filterFromDocument(driver, contentElements) {
  await driver.executeScript(
    `
      let excludedWordsList = [
        "1.",
        "We",
        "blog",
        "Our",
        "@",
        ".com",
        "our",
        "we",
        "-",
        "1",
        "website"
      ];
    let documentParagraphElements = document.querySelectorAll(".ql-editor p");
    for (let i = 0; i < excludedWordsList.length; i++) {
      for(let j = 0; j < documentParagraphElements.length; j++){
        if(documentParagraphElements[j].innerHTML.includes(excludedWordsList[i]) || documentParagraphElements[j].innerHTML  === "<br>"){
          documentParagraphElements[j].innerHTML = ""
        }
      }
    }
    `
  );
}

// MAIN FUNCTION
async function startNewAutomateInstance(data = {}) {
  if (data === {}) return;
  let { username, password, description, keywords, wordCountLimit } = data;
  wordCountLimit += 150;

  const driver = new Builder().forBrowser("chrome").build();
  await driver.manage().window().maximize();

  await driver.get("https://app.conversion.ai/");
  await loginUser(driver, username, password);

  await stepOne(driver, description, keywords);
  await stepTwo(driver, description);
  await stepThree(driver, description);
  await stepFour(driver);
  await createHeadline(driver);
  await setDocumentToPowerMode(driver);
  await createBlogPostOutline(driver);

  // write content
  try {
    const outlineArray = await createBlogPostOutlineModule(driver)
      .saveOutlineIntoArray()
      .catch((err) => handleError(driver, err));
    const xpathDocument = By.xpath(`//*[@id="docEditor"]/div[1]`);
    const xpathLastChild = By.xpath(`//*[@id="docEditor"]/div[1]/p[last()]`);
    const xpathHeaderTwo = By.xpath(`//*[@id="toolbar"]/button[2]`);
    const xpathComposeButton = By.xpath(
      `//*[@id="app"]/div[1]/div[1]/div/div/div[7]/div/div/div/button[1]`
    );
    const placeHolderText = `Random words to enable compose button to generate more content Random words to enable compose button to generate more content Random words to enable compose button to generate more content Random words to enable compose button to generate more content Random words to enable compose button to generate more content Random words to enable compose button to generate more content`;

    await driver.wait(until.elementLocated(xpathDocument), 20000); // set delay for testing

    let currentSectionWordCount = 0;
    let currentSection = await driver.findElements(
      By.xpath(`//*[@id="docEditor"]/div[1]/h2[last()]/following-sibling::p`)
    );
    let currentSectionString = "";
    let sectionWordCountLimit = wordCountLimit / outlineArray.length;

    // delete 2nd paragraphs
    await driver.executeScript(`
        for(let i = 1; i < document.querySelectorAll(".ql-editor p").length; i++){
          document.querySelectorAll(".ql-editor p")[i].innerHTML = ""
        }
  `);
    await driver.sleep(300);
    await driver.findElement(xpathLastChild).sendKeys(Key.DELETE);

    async function insertHeadline(headline) {
      await driver.sleep(300);
      await console.log("INSERTING NEW HEADLINE");
      await driver.sleep(300);
      await driver
        .findElement(xpathDocument)
        .sendKeys(Key.chord(Key.CONTROL, Key.END));
      await driver.sleep(300);
      await driver.findElement(xpathLastChild).sendKeys(Key.RETURN, headline);
      await driver.sleep(300);
      await driver
        .findElement(xpathLastChild)
        .sendKeys(Key.chord(Key.SHIFT, Key.HOME));
      await driver.findElement(xpathHeaderTwo).click();
      await driver.sleep(300);
    }
    async function insertBlogSectionIntro() {
      // WAIT UNTIL ELEMENTS ARE PRESENT CONDITION
      const xpathBlogPostIntroButton = By.xpath(
        `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[1]/div/div/button[7]`
      );
      await driver.wait(until.elementsLocated(xpathBlogPostIntroButton));

      // ENTER BLOG POST INTRO EDITOR
      const blogPostIntroButton = await driver.findElement(
        xpathBlogPostIntroButton
      );
      await sleep(5000);
      await blogPostIntroButton.click();
      await sleep(5000);

      // WAIT UNTIL ELEMENTS ARE PRESENT CONDITION
      const xpathGenerate = By.xpath(
        `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/form/div[2]/div[2]/button`
      );
      await driver.wait(until.elementsLocated(xpathGenerate));

      const generate = await driver.findElement(xpathGenerate);

      // INPUT ELEMENTS
      const title = await driver.findElement(
        By.xpath(`//*[@id="blogPostTitle"]`)
      );
      const audience = await driver.findElement(
        By.xpath(`//*[@id="audience"]`)
      );
      const tone = await driver.findElement(By.xpath(`//*[@id="tone"]`));

      await title.sendKeys(Key.chord(Key.CONTROL, "a"));
      await sleep(6000);
      await title.sendKeys(Key.DELETE);

      await sleep(6000);
      const lastSectionTitle = await driver
        .findElement(By.xpath(`//*[@id="docEditor"]/div[1]/h2[last()]`))
        .getText();

      await sleep(6000);
      await title.sendKeys(lastSectionTitle);

      await sleep(6000);
      await audience.clear();

      await sleep(6000);
      await audience.sendKeys("People");

      await sleep(6000);
      await tone.clear();

      await sleep(6000);
      await tone.sendKeys("Informative");

      await sleep(6000);
      await generate.click();

      await waitForGenerateToFinish(driver);

      await sleep(6000);
      await driver
        .findElement(
          By.xpath(
            `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/div/div[2]/button[2]`
          )
        )
        .click();

      // paste intro in document
      await sleep(6000);
      await driver
        .findElement(xpathDocument)
        .sendKeys(Key.chord(Key.CONTROL, Key.END));

      await sleep(6000);
      await driver.findElement(xpathDocument).sendKeys(Key.RETURN);

      await sleep(6000);
      await driver
        .findElement(xpathDocument)
        .sendKeys(Key.chord(Key.CONTROL, "v"));

      // finish creating intro
    }
    async function composeUsingBlogSectionEditor() {
      // WAIT UNTIL ELEMENTS ARE PRESENT CONDITION
      const xpathBlogPostIntroButton = By.xpath(
        `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[1]/div/div/button[7]`
      );
      await driver.wait(until.elementsLocated(xpathBlogPostIntroButton));
      // ENTER BLOG POST INTRO EDITOR
      const blogPostIntroButton = await driver.findElement(
        xpathBlogPostIntroButton
      );
      await sleep(5000);
      await blogPostIntroButton.click();
      await sleep(5000);

      // WAIT UNTIL ELEMENTS ARE PRESENT CONDITION
      const xpathGenerate = By.xpath(
        `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/form/div[2]/div[2]/button`
      );
      await driver.wait(until.elementsLocated(xpathGenerate));

      const generate = await driver.findElement(xpathGenerate);

      // INPUT ELEMENTS
      const title = await driver.findElement(
        By.xpath(`//*[@id="blogPostTitle"]`)
      );
      const audience = await driver.findElement(
        By.xpath(`//*[@id="audience"]`)
      );
      const tone = await driver.findElement(By.xpath(`//*[@id="tone"]`));

      const getLastParagraph = await driver
        .findElement(xpathLastChild)
        .getText();
      const splitLastParagraph = await getLastParagraph.split(". ");
      const lastSentence = await splitLastParagraph[
        splitLastParagraph.length - 1
      ];

      // clear default and input
      await sleep(6000);
      await title.clear();
      await sleep(6000);
      await title.sendKeys(lastSentence);
      await sleep(6000);

      await sleep(6000);
      await audience.clear();
      await sleep(6000);
      await audience.sendKeys(description);
      await sleep(6000);

      await sleep(6000);
      await tone.clear();
      await sleep(6000);
      await tone.sendKeys("Informative");
      await sleep(6000);

      await sleep(6000);
      await driver.findElement(xpathGenerate).click();
      await sleep(6000);

      // wait until generating is complete
      await waitForGenerateToFinish(driver);
      // await sleep(20000);

      // copy to clipboard
      await sleep(5000);
      await driver
        .findElement(
          By.xpath(
            `//*[@id="app"]/div[1]/div[1]/div/div/div[5]/div/div[2]/div[2]/div[2]/div/div[1]/div/div[2]/button[2]`
          )
        )
        .click();

      // get to last page of document
      await sleep(5000);
      await driver
        .findElement(xpathDocument)
        .sendKeys(Key.chord(Key.CONTROL, Key.END));

      await sleep(5000);
      await driver.findElement(xpathDocument).sendKeys(Key.RETURN);

      // paste to document
      await sleep(5000);
      await driver
        .findElement(xpathDocument)
        .sendKeys(Key.chord(Key.CONTROL, "v"));

      await driver.sleep(10000);

      // update wit new current section items
      currentSection = await driver.findElements(
        By.xpath(`//*[@id="docEditor"]/div[1]/h2[last()]/following-sibling::p`)
      );

      // filter document content
      // await filterFromDocument(driver, currentSection);

      // get the current section word count
      for (let i = 0; i < currentSection.length; i++) {
        if (currentSection[i] !== "<br>") {
          currentSectionString += await currentSection[i].getAttribute(
            "textContent"
          );
        }
      }
      currentSectionWordCount = currentSectionString.split(" ").length;

      // TESTING
      console.log(outlineArray);
      console.log(`ARRAY : ${currentSectionString.split(" ")}`);
      console.log("REACHED END OF COMPOSE FUNCTION");
    }
    // create content
    for (let i = 0; i < outlineArray.length; i++) {
      await insertHeadline(outlineArray[i]);
      await insertBlogSectionIntro();
      currentSectionString = "";
      currentSectionWordCount = 0;
      while (sectionWordCountLimit) {
        await composeUsingBlogSectionEditor();
        if (currentSectionWordCount > sectionWordCountLimit) {
          console.log(currentSectionWordCount);
          console.log("reached word count limit for this section!");
          break;
        }
      }
    }

    
  } catch (err) {
    console.log(err);
    await driver.close();
  }

  await sleep(5000)
  async function getContentData() {
    let contentData = {
      title: "",
      introPar: "",
      sections: [],
    };

    // start iteration from -1
    let hIterated = -1;
    for (let i = 0; i < elements.length; i++) {
      if (i === 0) contentData.title = await elements[i].getText();
      if (i === 1) contentData.introPar = await elements[i].getText();
      if (i >= 2) {
        switch (await elements[i].getTagName()) {
          case "h2":
            contentData.sections.push({
              header: await elements[i].getText(),
              par: [],
            });
            hIterated++;
            break;
          case "p":
            if ((await elements[i].getText()) !== "") {
              contentData.sections[hIterated].par.push(
                await elements[i].getText()
              );
            }
            break;
          default:
            break;
        }
      }
    }

    // log content
    console.log(contentData);
    for (let i = 0; i < contentData.sections.length; i++) {
      console.log(contentData.sections[i]);
    }

    return contentData;
  }
  return await getContentData()
}
