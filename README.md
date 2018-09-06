# jsont

JSONT is an extension to JSON that lets you use templates.

JSONT's syntax extension is simple:
- anything of the format `$[var]` is replaced with the value of `var`.
- anything of the format `$[date:now]` calls the corresponding library method you supply it with.

`date` (JS Date) and `oid` (BSON ObjectID) are inbuilt library methods. The available calls are:
- `date:now`
- `data:+1h`
- `data:-1d`
- `oid:new`
- `oid:5b912a771c9d44580b1c5915`

## Usage

```JavaScript
const JSONT = require('@codefeathers/jsont');

const env = { '1': 'hello' };

console.log(
	JSONT.toJSON(
		JSONT.parse(
			'{ "sample": "$[1]", "now": "$[date:now]" }',
			env,
		)));
```

Remember, the parsed template will still be a string. You have to use `.toJSON` or `JSON.parse` to parse it into an object.
