// markdown formatter

let sample = "*hello* -- **world** -- ***this is markdown***";

function parseMarkdown(text) {
    /*
    let re1 = new RegExp('<', 'g');
    data = data.replace(re1, "&lt;").replace(new RegExp('>', 'g'), "&gt;");
    */
    let newStringArray = [];
    let splitString = text.split(" ");
    for (let component in splitString) {
        component = splitString[component];
        console.log(component);

        let newString = component.replace(/\*(.*?)\*/gi, `<i>${component}</i>`);
        newString = component.replace(/\**(.*?)\**/gi, `<b>${component}</b>`);
        // newString = component.replace(/\***(.*?)\***/gi, `<b><i>${component}</b></i>`);
        newString = component.replace(/\`(.*?)\`/gi, `<code>${component}</code>`);

        newStringArray.push(newString);
    }

    let final = newStringArray.join(" ")

    return final;
}


result = parseMarkdown(sample);
console.log(result)
