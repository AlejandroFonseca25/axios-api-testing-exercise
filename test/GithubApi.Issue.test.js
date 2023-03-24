const { StatusCodes } = require("http-status-codes");
const { expect } = require("chai");
const axios = require("axios");
const dotenv = require("dotenv");

const urlBase = "https://api.github.com";
const username = "AlejandroFonseca25";
const repository = "axios-api-testing-exercise";
const issueTitle = "Test issue";
let issueNumber;

async function getIssue() {
  return (issueGetResponse = await axios.get(
    `${urlBase}/repos/${username}/${repository}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `token ${process.env.ACCESS_TOKEN}`,
      },
    }
  ));
}

describe("Github API Issue Test", () => {
  beforeEach(() => {
    dotenv.config();
  });

  it("1) Repository existence on user", async () => {
    const reposResponse = await axios.get(
      `${urlBase}/users/${username}/repos`,
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`,
        },
      }
    );

    expect(reposResponse.status).to.equal(StatusCodes.OK);
    //Mapping of the repository names found in data, to match our repository
    expect(reposResponse.data.map((nameValue) => nameValue.name)).to.include(
      `${repository}`
    );
  });

  it("2) Issue creation", async () => {
    const issue = {
      title: `${issueTitle}`,
      owner: `${username}`,
      repo: `${repository}`,
    };

    const issuePostResponse = await axios.post(
      `${urlBase}/repos/${username}/${repository}/issues`,
      issue,
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`,
        },
      }
    );

    expect(issuePostResponse.status).to.equal(StatusCodes.CREATED);
    expect(issuePostResponse.data.title).to.equal(issue.title);
    expect(issuePostResponse.data.body).not.exist;
    issueNumber = issuePostResponse.data.number;
  });

  it("3) Body addition to existing issue", async () => {
    const issue = {
      owner: `${username}`,
      repo: `${repository}`,
      issue_number: `${issueNumber}`,
      body: "This is a body for Test issue",
    };

    const issuePatchResponse = await axios.patch(
      `${urlBase}/repos/${username}/${repository}/issues/${issueNumber}`,
      issue,
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`,
        },
      }
    );
    expect(issuePatchResponse.status).to.equal(StatusCodes.OK);

    const issueGetResponse = await getIssue();

    expect(issueGetResponse.data.title).to.equal(`${issueTitle}`);
    expect(issueGetResponse.data.body).to.equal(issue.body);
  });

  it("4) Lock issue", async () => {
    const issue = {
      owner: `${username}`,
      repo: `${repository}`,
      issue_number: `${issueNumber}`,
      lock_reason: "resolved",
    };

    const putLockResponse = await axios.put(
      `${urlBase}/repos/${username}/${repository}/issues/${issueNumber}/lock`,
      issue,
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`,
        },
      }
    );

    expect(putLockResponse.status).to.equal(StatusCodes.NO_CONTENT);

    const issueGetResponse = await getIssue();

    expect(issueGetResponse.data.active_lock_reason).to.equal(
      issue.lock_reason
    );
    expect(issueGetResponse.data.locked).to.equal(true);
  });

  it("5) Unlock issue", async () => {
    const issue = {
      owner: `${username}`,
      repo: `${repository}`,
      issue_number: `${issueNumber}`,
    };

    const deleteUnlockResponse = await axios.delete(
      `${urlBase}/repos/${username}/${repository}/issues/${issueNumber}/lock`,
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`,
        },
      }
    );

    expect(deleteUnlockResponse.status).to.equal(StatusCodes.NO_CONTENT);

    const issueGetResponse = await getIssue();

    expect(issueGetResponse.data.locked).to.equal(false);
  });
});
