"use strict";

const ldb = new LocalDB("catatan");

function autoResize() {
  $(event.target).innerHeight(function() {
    $(this).innerHeight(0);

    return this.scrollHeight;
  });
}

function nl2br(str, replaceMode, isXhtml) {
  const breakTag = (isXhtml) ? '<br />' : '<br>';
  const replaceStr = (replaceMode) ? '$1' + breakTag : '$1' + breakTag + '$2';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
}

function cariCatatan() {
  let hasilPencarian = 0;
  const kataKunci = $(event.target).val().toLowerCase();

  $("[data-search=notes]").each(function(index, element) {
    const teksCatatan = $(element).find(".card > .card-header, .card-body").text().toLowerCase();

    if (teksCatatan.includes(kataKunci) === true) {
      $(element).fadeIn("fast");

      hasilPencarian++;
    } else {
      $(element).fadeOut("fast");
    }
  });

  if (hasilPencarian > 0) {
    $("#catatanTidakDitemukan").fadeOut("fast");
  } else {
    $("#catatanTidakDitemukan").fadeIn("fast");
  }

  $("[data-masonry]").masonry({
    columnWidth: ".col-sm-6, .col-md-4, .col-lg-3",
    itemSelector: "[data-search=notes]",
    percentPosition: true
  });
  $("#totalCatatan").text(hasilPencarian);
}

function pesanAlert(ikon, status, teks) {
  const alert = $(`
    <div class="alert alert-${status} alert-dismissible fade shadow show">
      <i class="bi bi-${ikon}-circle-fill"></i>
      <span class="ms-2">${teks}</span>
      <button class="btn-close" data-bs-dismiss="alert" type="button"></button>
    </div>
  `);

  $("#container").prepend(alert);
}

function templatCatatan(judul, isi, index, id) {
  return $(`
    <div class="col-sm-6 col-md-4 col-lg-3" data-search="notes">
      <div class="card shadow" data-aos="fade-up" data-aos-delay="${50 * index}" data-notes="${id}">
        <h5 class="card-header">${judul}</h5>
        <div class="card-body">
          ${nl2br(isi)}
        </div>
        <div class="card-footer">
          <button class="btn btn-primary shadow" data-bs-target="#detailModal" data-bs-toggle="modal" onclick="detailCatatan(${id})" type="button">
            <i class="bi bi-eye"></i>
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  `);
}

function tambahCatatan() {
  event.preventDefault();

  const formCatatan = $(event.target).serializeObject();
  const dataCatatan = {
    "id": ldb.find().length,
    "judul": formCatatan.judulCatatan,
    "isi": formCatatan.isiCatatan,
    "createdAt": new Date().format("d F Y H:i:s"),
    "updatedAt": new Date().format("d F Y H:i:s")
  };

  ldb.insert(dataCatatan);

  const catatan = templatCatatan(formCatatan.judulCatatan, formCatatan.isiCatatan, ldb.find().length - 1, ldb.find().length - 1);

  $("[data-masonry]").masonry({
    columnWidth: ".col-sm-6, .col-md-4, .col-lg-3",
    itemSelector: "[data-search=notes]",
    percentPosition: true
  }).prepend(catatan)
    .masonry("prepended", catatan);

  if (ldb.find().length > 0) {
    $("#tidakAdaCatatan").hide();
  }

  $("#totalCatatan").text(ldb.find().length);
  $(event.target).find("button[type=reset]").click();
  pesanAlert("check", "success", "Catatan berhasil ditambahkan");
}

function detailCatatan(idCatatan) {
  const catatan = ldb.find(idCatatan);

  $("#idCatatan").val(idCatatan);
  $("#ubahJudulCatatan").val(catatan.judul);
  $("#ubahIsiCatatan").val(catatan.isi);
}

function ubahCatatan() {
  event.preventDefault();

  const formCatatan = $(event.target).serializeObject();
  const catatan = ldb.find(formCatatan.idCatatan);
  const dataCatatan = {
    "id": formCatatan.idCatatan,
    "judul": formCatatan.judulCatatan,
    "isi": formCatatan.isiCatatan,
    "createdAt": catatan.createdAt,
    "updatedAt": new Date().format("d F Y H:i:s")
  };

  ldb.update(dataCatatan, formCatatan.idCatatan);

  $(`[data-notes=${formCatatan.idCatatan}] > .card-header`).text(formCatatan.judulCatatan);
  $(`[data-notes=${formCatatan.idCatatan}] > .card-body`).html(nl2br(formCatatan.isiCatatan));
  $(event.target).find("button[type=reset]").click();
  pesanAlert("check", "success", "Catatan berhasil diubah");
}

function hapusCatatan() {
  const idCatatan = $("#idCatatan").val();
  ldb.delete(idCatatan);

  const catatan = $(`[data-notes=${idCatatan}]`).parent();

  $("[data-masonry]").masonry({
    columnWidth: ".col-sm-6, .col-md-4, .col-lg-3",
    itemSelector: "[data-search=notes]",
    percentPosition: true
  }).masonry("remove", catatan)
    .masonry("layout");

  if (ldb.find().length <= 0) {
    $("#tidakAdaCatatan").show();
  }

  $("#totalCatatan").text(ldb.find().length);
  $(event.target).next().click();
  pesanAlert("check", "success", "Catatan berhasil dihapus");
}

$(document).ready(function(){
	AOS.init({
    duration: 500,
    easing: "ease-in-out-quart",
    once: true
  });
  
  $.each(ldb.find(), function(index, value) {
    const catatan = templatCatatan(value.judul, value.isi, index, value.id);

    $("[data-masonry]").masonry({
      columnWidth: ".col-sm-6, .col-md-4, .col-lg-3",
      itemSelector: "[data-search=notes]",
      percentPosition: true
    }).prepend(catatan)
    .masonry("prepended", catatan);
  });

  if (ldb.find().length <= 0) {
    $("#tidakAdaCatatan").show();
  }

  $("#totalCatatan").text(ldb.find().length);
  $("#loading").remove();
  $("#currentYear").text(new Date().getFullYear());
});

$(document).on("scroll", function() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    $("#scrollTop").fadeIn("fast");
  } else {
    $("#scrollTop").fadeOut("fast");
  }
});
