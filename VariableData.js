class VariableData {
    constructor(my_name, my_html, my_weight_editable) {
        this.update(my_name, my_html,my_weight_editable);
    }

    update(my_name, my_html, my_weight_editable) {
        this.name = my_name;
        this.html = my_html;
        this.weight_editable = my_weight_editable;
    }
}
