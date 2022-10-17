$(document).ready(function () {
  var db = localStorage.getItem("shortens") || "[]";
  db = JSON.parse(db);

  $("#result").hide();
  $("#error").hide();
  $("#total_shortens").text(db.length);

  if (db.length < 1) {
    $("#recent_shortens").hide();
  } else {
    $("#recent_shortens").show();
  }

  $("input:checkbox").click(function () {
    $("input#custom_key").attr("disabled", !this.checked);
    if (this.checked) {
      $("input#custom_key").attr("placeholder", "/your-link");
    } else {
      $("input#custom_key").attr("placeholder", "Check to customize your link");
    }
  });

  $("#shorten").click(function () {
    var url = $("#url").val();
    var customKey = $("#custom_key").val();
    var isCustomKey = $("input:checkbox").is(":checked");
    var data = {
      url: url,
    };

    if (isCustomKey) data["custom_key"] = customKey;

    axios
      .post("/api/v1/url", data)
      .then(({ data: { data: result } }) => {
        $("#result").show();
        $("#error").hide();
        var { key, redirect_uri } = result;
        $("#redirect_uri").val(`${window.location.href}${key}`);
        $("#visit_redirect_uri").attr("href", `${window.location.href}${key}`);

        db.push({ key, redirect_uri });
        saveToLocalStorage(db);
      })
      .catch(
        ({
          response: {
            data: { message },
          },
        }) => {
          $("#error").show();
          $("#result").hide();
          $("#error").text(message);
        }
      );
  });

  $("#copy").click(function () {
    copyToClipboard("#redirect_uri");
    $("#copy").removeClass("btn-outline-info");
    $("#copy").addClass("btn-success");
    $("#copy").text("Copied!");
    setTimeout(() => {
      $("#copy").removeClass("btn-success");
      $("#copy").addClass("btn-outline-info");
      $("#copy").addClass("fa fa-copy");
      $("#copy").text(" Copy");
    }, 500);
  });

  db.reverse().forEach(({ key, redirect_uri }) => {
    var href = `${window.location.origin}/${key}`;

    var data = `<div class="media text-muted pt-3"><div class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray"><div class="d-flex justify-content-between align-items-center w-100"><strong class="text-gray-dark">  ${redirect_uri}</strong><a href="${href}" target="_blank" class="btn btn-outline-primary text-decoration-none"><i class="fa fa-external-link"></i> Visit</a></div><span class="d-block">${href}</span></div></div>`;
    $("#shortens").append(data);
  });

  db.slice(db.length - 3, db.length)
    .reverse()
    .forEach(({ key, redirect_uri }) => {
      var href = `${window.location.origin}/${key}`;

      var data = `<div class="media text-muted pt-3"><div class="media-body pb-3 mb-0 medium lh-125 border-bottom border-gray"><div class="d-flex justify-content-between align-items-center w-100"><strong class="text-gray-dark" > ${redirect_uri}</strong><a href="${href}" target="_blank" class="btn btn-outline-primary text-decoration-none"><i class="fa fa-external-link"></i> Visit</a></div><span class="d-block">${href}</span></div></div>`;
      $("#recent_shortens").append(data);
    });

  axios.get("/api/v1/contributors").then(({ data }) => {
    var { contributors } = data;
    $("#total_contributors").text(contributors.length);
    contributors.forEach((user) => {
      axios.get(`https://api.github.com/users/${user}`).then(({ data: { avatar_url, url, login, name } }) => {
        axios.get("https://api.github.com/repos/kodingkeun/shorturl/commits").then(({ data: commits }) => {
          var {
            author,
            html_url,
            commit: { message },
          } = commits.filter((user) => user.author.login === login)[0];
          var commit_data = `<a href="${html_url}" target="_blank">${message.split("\n")[0]}</a>`;
          var data = `<div class="media text-muted pt-3"><img src="${avatar_url}" class="bd-placeholder-img mr-2 rounded" width="100" height="100"><div class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray"><div class="d-flex justify-content-between align-items-center w-100"><strong class="text-gray-dark">${
            name || login
          } ${author.login === login ? commit_data : ""}</strong><a href="https://github.com/${login}" target="_blank">Follow</a></div><span class="d-block">@${login}</span></div></div>`;
          $("#contributors").append(data);
        });
      });
    });
  });

  function saveToLocalStorage(data) {
    localStorage.setItem("shortens", JSON.stringify(data));
  }

  function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
  }
});
