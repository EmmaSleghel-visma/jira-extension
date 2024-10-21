import * as vscode from "vscode";
import axios from "axios";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "jira-ext.executeJql",
    async (jql) => {
      if (!jql) {
        jql = await vscode.window.showInputBox({
          placeHolder: "Enter JQL query",
        });
      }
      const panel = vscode.window.createWebviewPanel(
        "jqlResult",
        "Spooky Jira Tab",
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = "<html><body><h1>Loading...</h1></body></html>";

      try {
        const result = await executeQuery(jql);
        panel.webview.html = generateHtml(result);
      } catch (error) {
        vscode.window.showErrorMessage("It's a demo, of course something goes south!");
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function executeQuery(jql: string): Promise<any[]> {
  try {
    const response = await axios.get(
      "yourJiraJqlExecutionUrl" + jql
    );
    return response.data?.value?.issues;
  } catch (error) {
    console.error("Error fetching Jira issues:", error);
    throw error;
  }
}

function generateHtml(issues?: any[]): string {
  let html = `<html><body><h2>Spooky-looking JQL result</h2><ul>`;
  if(!issues || issues.length === 0) {
    html += `<li><span>No issues found</span></li>`;
    html += `</ul></body></html>`;
    return html;
  }
  for (const issue of issues) {
    html += `<li><span><strong>${issue.key}</strong>: ${
      issue.fields.summary
    }</span><span> <strong>Assignee: </strong>${
      issue.fields.assignee?.displayName ?? "Unassigned"
    }</span><span> <strong>Status: </strong>${
      issue.fields.status?.name ?? "To Do"
    }</span></li>`;
  }
  html += `</ul></body></html>`;
  return html;
}

export function deactivate() {}
