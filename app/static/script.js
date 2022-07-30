`use strict`;

const deepl_url = `https://www.deepl.com/translator#`;

// ペースト箇所
let paste_textarea      = document.getElementById("paste_textarea");
// フォーマット結果表示箇所
let format_textarea     = document.getElementById("format_textarea");
// 翻訳結果表示箇所
let translate_textarea  = document.getElementById("translate_textarea");
// ペースト箇所文字数表示
let paste_count         = document.getElementById("paste_count");
// フォーマット結果文字数表示
let format_count        = document.getElementById("format_count");

// 警告の表示先である要素を取得
const text_error        = document.getElementById("text_error");
// 送信ボタンを取得
const submit_button     = document.getElementById("submit_button");
// 変換ボタンを取得
const conversion_button = document.getElementById("conversion_button");
// 文字消去ボタンを取得
const clear_button      = document.getElementById("clear_button");

// フォーマットするリストを取得
let format_list = [];
let request = new XMLHttpRequest();
request.open("GET", "/static/format.json");
request.send()
// JSON読み込み時の処理
request.onreadystatechange = () => {
    // 全てのデータを受信・正常に処理された場合
    if (request.readyState == 4 && request.status == 200) {
        // JSONデータを変換しリストに追加
        let json = JSON.parse(request.responseText);
        for (let i = 0; i < json["format_list"].length; i++) {
            format_list.push(json["format_list"][i]);
        }
    }
}

// 文字数をカウントする関数
function textCounter(text) {
    return text.length;
}

// ボタンを無効化する関数
function invalidateButton(message=``, s=false) {
    submit_button.disabled = true;
    if (message != ``) {
        text_error.innerHTML = `<p class="text-danger">` + message + `</p>`;
    } else {
        text_error.innerHTML = ``;
    }
    if (s == true) {
        submit_button.innerHTML = `<s>Translate By DeepL</s>`;
    } else {
        submit_button.innerHTML = `Translate By DeepL`;
    }
}

// ボタンを有効化する関数
function validateButton() {
    text_error.innerHTML = ``;
    submit_button.disabled = false;
    submit_button.innerHTML = `Translate By DeepL`;
}

// ペースト箇所に変更があれば実行する関数
paste_textarea.addEventListener("input", function() {
    console.log(format_textarea)
    // ペースト箇所の文字列を取得
    let paste_text = paste_textarea.value;
    // 文字列の長さを取得
    let text_length = textCounter(paste_text);
    // 文字数表示
    paste_count.value = String(text_length) + ` Characters`;
    // もし文字列入力がなければ
    if (text_length == 0) {
        // ボタンを無効化
        invalidateButton();
        conversion_button.disabled = true;
    }
    // もし5000文字以上であれば
    else if (text_length > 5000) {
        // 警告を表示し、ボタンを無効化
        let message = `Translation using DeepL is not possible because it exceeds 5000 characters.`;
        invalidateButton(message=message, s=true);
    } else {
        // 警告を非表示し、ボタンを有効化
        validateButton();
        conversion_button.disabled = false;
    }
    // 変換リストをもとに変換した結果を作成
    for (let i = 0; i < format_list.length; i++) {
        paste_text = paste_text.replaceAll(format_list[i][0], format_list[i][1]);
    }
    format_textarea.value = paste_text;
    format_count.value = String(textCounter(paste_text)) + ` Characters`;
    return 0;
});

// 翻訳ボタンをクリックすると実行する関数
submit_button.addEventListener("click", function() {
    // ペースト箇所の文字列を取得
    let format_text = format_textarea.value;
    // 文字列の長さを取得
    let text_length = textCounter(format_text);
    // もし文字列入力がなければ
    if (text_length == 0) {
        // 警告を表示し、ボタンを無効化
        let message = `Translation using DeepL is not possible because there is no characters.`;
        invalidateButton(message=message, s=false);
    }
    // もし5000文字以上であれば
    else if (text_length > 5000) {
        // 警告を表示し、ボタンを無効化
        let message = `Translation using DeepL is not possible because it exceeds 5000 characters.`;
        invalidateButton(message=message, s=true);
    } else {
        // 翻訳するためにDeepLを新規タブで開く処理
        // 翻訳元、翻訳先の言語を取得
        let from_lang = document.getElementById("from_lang").value;
        let to_lang = document.getElementById("to_lang").value;
        // 翻訳元、翻訳先の言語が重複していれば
        if (from_lang == to_lang) {
            // エラーを出力
            text_error.innerHTML = `<p class="text-danger">Cannot translate due to language duplication.</p>`;
        } else {
            // URLを生成し、新規タブで開く
            let translate_url = deepl_url + from_lang + `/` + to_lang + `/` + format_text;
            window.open(translate_url);
        } 
    }
});

// 追加変換ボタンをクリックした時の処理
conversion_button.addEventListener("click", function() {
    // 変換前の入力欄
    let before_conversion = document.getElementById("before_conversion").value;
    // 変換後の入力欄
    let after_conversion  = document.getElementById("after_conversion").value;
    // もし、いずれかの要素が空であれば
    if (before_conversion == ``) {
        // エラーを出力
        text_error.innerHTML = `<p class="text-danger">Conversion not possible because the required information has not been entered.</p>`;
    } else {
        // そうでなければ、変換処理を行う
        // ペースト箇所の文字列を取得
        let format_text = format_textarea.value;
        let new_format_text = format_text.replaceAll(before_conversion, after_conversion);
        // 結果を表示
        format_textarea.value = new_format_text;
        format_count.value = String(textCounter(new_format_text)) + ` Characters`;
        return 0;
    }
});

// テキスト削除ボタンをクリックした時の処理
clear_button.addEventListener("click", function() {
    console.log(paste_textarea)
    // テキストを削除
    paste_textarea.value  = ``;
    format_textarea.value = ``;
    // 文字数カウントを0にする
    paste_count.value  = `0 Characters`;
    format_count.value = `0 Characters`;
    // ボタンを無効化
    invalidateButton();
    conversion_button.disabled = true;
    return 0;
});