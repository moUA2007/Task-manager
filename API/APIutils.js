class APIutils {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['sort', 'page', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        const parsedObj = {};

        Object.keys(queryObj).forEach(key => {
            if (key.includes('[')) {
                const field = key.split('[')[0];
                const op = key.split('[')[1].replace(']', '');
                if (!parsedObj[field]) parsedObj[field] = {};
                parsedObj[field]['$' + op] = Number(queryObj[key]);
            } else {
                parsedObj[key] = Number(queryObj[key]);
            }
        });

        this.query = this.query.find(parsedObj);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy); // ✅ صح
        } else {
            this.query = this.query.sort('-createdAt'); // ترتيب افتراضي
        }
        return this;
    }

    async pagination(){
    const page = this.queryString.page*1 || 1
    const limit = this.queryString.limit*1 || 5
    const skip = (page-1)*limit
    if (this.queryString.page) {
        const numTasks = await this.query.clone().countDocuments(); 
        if (skip >= numTasks) {
            throw new Error('This page does not exist'); 
        }
    }
    this.query = this.query.skip(skip).limit(limit);
    }

    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        }
        else{
            this.query = this.query.select('-__v')
        }
        return this
    }
} 

    



module.exports = APIutils;