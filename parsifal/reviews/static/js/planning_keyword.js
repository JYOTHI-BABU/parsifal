$(function () {
  $.fn.bindAddSynonym = function () {
    $(this).keyup(function (event) {
      if (event.keyCode == 13) {
        var synonym = $(this).val();
        var keyword_id = $(this).closest("tr").attr("keyword-id");
        var review_id = $("#review-id").val();
        var input = $(this);
        $.ajax({
          url: '/reviews/planning/add_synonym/',
          data: { 'review-id': review_id, 'keyword-id': keyword_id, 'synonym': synonym },
          cache: false,
          type: 'get',
          success: function (data) {
            input.siblings("ul").append(data);
            input.val("");
            input.focus();
            $("#tbl-keywords td ul li").unbind("click").bind("click", editSynonym);
          }
        });
      }
    });
  };

  function loadKeywordSettings() {
    $(".add-synonym").unbind("keyup");
    $(".add-synonym").bindAddSynonym();
    $(".btn-remove-keyword").unbind("click").bind("click", removeKeyword);
    $("#tbl-keywords td.keyword-row").unbind("click").bind("click", editKeyword);
  }

  $(".add-synonym").bindAddSynonym();

  function saveKeyword(keyword_id) {
    var description = $(".edit-keyword").val();
    $.ajax({
      url: '/reviews/planning/save_keyword/',
      data: { 'review_id': $("#review-id").val(), 'keyword_id': keyword_id, 'description': description },
      type: 'get',
      cache: false,
      success: function (data) {
        $(".edit-keyword").closest("td").html(data);
        $("#tbl-keywords td.keyword-row").bind("click", editKeyword);
      }
    });
  }

  function cancelEditKeyword(description) {
    $(".edit-keyword").closest("td").html(description);
    $("#tbl-keywords td.keyword-row").bind("click", editKeyword);
  }

  function editKeyword() {
    $("#tbl-keywords td.keyword-row").unbind("click");
    var description = $(this).text();
    var keyword_id = $(this).closest("tr").attr("keyword-id");
    $(this).html("<input type='text' value='" + description + "' class='edit-keyword'>");
    $(".edit-keyword").focus();
    $(".edit-keyword").blur(function () {
        saveKeyword(keyword_id);
    });
    $(".edit-keyword").keyup(function (event) {
      if (event.keyCode == 13) {
        saveKeyword(keyword_id);
      } else if (event.keyCode == 27) {
        cancelEditKeyword(description);
      }
    });
  }

  $("#tbl-keywords td.keyword-row").click(editKeyword);
  
  function saveSynonym(synonym_id, old_description) {
    var btn = $(".edit-synonym").closest("ul").siblings(".add-synonym");
    var description = $(".edit-synonym").val();
    $.ajax({
      url: '/reviews/planning/save_synonym/',
      data: { 'review-id': $("#review-id").val(), 'synonym-id': synonym_id, 'description': description },
      type: 'get',
      cache: false,
      success: function (data) {
        if (description == "") {
          $(".edit-synonym").closest("li").remove();  
        }
        else {
          $(".edit-synonym").closest("li").html(data);
        }
        $("#tbl-keywords td ul li").unbind("click").bind("click", editSynonym);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        cancelEditSynonym(old_description);
      },
      complete: function () {
        btn.show();
      }
    });    
  }

  function cancelEditSynonym(description) {
    var btn = $(".edit-synonym").closest("ul").siblings(".add-synonym");
    $(".edit-synonym").closest("li").html(description);
    $("#tbl-keywords td ul li").bind("click", editSynonym);
    $(this).closest("ul").siblings(".add-synonym").show();
    btn.show();
  }

  function editSynonym() {
    $("#tbl-keywords td ul li").unbind("click");
    var btn_add_synonym = $(this).closest("ul").siblings(".add-synonym");
    btn_add_synonym.hide();
    var description = $(this).text();
    var synonym_id = $(this).attr("synonym-id");
    $(this).html("<input type='text' value='" + description + "' class='edit-synonym'>");
    $(".edit-synonym").focus();
    $(".edit-synonym").blur(function () {
      if (description != $(".edit-synonym").val()) {
        saveSynonym(synonym_id, description);
      }
      else {
        cancelEditSynonym(description);
      }
    });
    $(".edit-synonym").keyup(function (event) {
      if (event.keyCode == 13) {
        saveSynonym(synonym_id, description);
      } else if (event.keyCode == 27) {
        cancelEditSynonym(description);
      }
    });
  }

  $("#tbl-keywords td ul li").click(editSynonym);

  $("#import-pico-keywords").click(function () {
    $.ajax({
      url: '/reviews/planning/import_pico_keywords/',
      data: { 'review-id': $('#review-id').val() },
      cache: false,
      type: 'get',
      success: function (data) {
        $("#tbl-keywords tbody").append(data);
        loadKeywordSettings();
      }
    });
  });

  function removeKeyword() {
    var row = $(this).closest("tr");
    keyword_id = row.attr("keyword-id");
    $.ajax({
      url: '/reviews/planning/remove_keyword/',
      data: {'review_id': $('#review-id').val(), 'keyword_id': keyword_id },
      type: 'get',
      cache: false,
      success: function (data) {
        if (data != "ERROR"){
          row.remove();
        }
      }
    });
  }

  $(".btn-remove-keyword").click(removeKeyword);

  function saveNewKeyword() {
    var review_id = $("#review-id").val();
    var description = $("#input-add-keyword").val();
    $.ajax({
      url: '/reviews/planning/add_new_keyword/',
      data: { 'review_id': review_id, 'description': description },
      cache: false,
      type: 'get',
      success: function (data) {
        if (data != 'ERROR') {
          $("#tbl-keywords tbody tr:eq(0)").remove();
          $("#tbl-keywords tbody").prepend(data);
          loadKeywordSettings();
        }
      }
    });
  }

  function cancelNewKeyword() {
    $("#tbl-keywords tbody tr:eq(0)").remove();
  }

  $.fn.addKeywordSettings = function () {
    $(this).keyup(function (event) {
      if (event.keyCode == 13) {
        saveNewKeyword();
      } else if (event.keyCode == 27) {
        cancelNewKeyword();
      }
    });

    $(this).blur(cancelNewKeyword);
  };

  $("#add-keyword").click(function () {
    $("#tbl-keywords tbody").prepend("<tr><td><input type='text' id='input-add-keyword'></td><td></td><td></td><td class='no-border'>Press <strong>Enter</strong> to confirm or <strong>Esc</strong> to cancel.</td></tr>");
    $("#input-add-keyword").addKeywordSettings();
    $("#input-add-keyword").focus();
  });

});