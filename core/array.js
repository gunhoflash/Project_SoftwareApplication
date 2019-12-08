exports.clone_deep = (array) => {
    let i, clone = [];

    // handle exception
    if (!Array.isArray(array)) return null;

    for (i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            clone[i] = exports.clone_deep(array[i]); 
        } else {
            clone[i] = array[i];
        }
    }
    return clone;
};