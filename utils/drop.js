
const {query} = require("./psql")

async function DropMessageByAddressFunc() {
  console.log(`DROP FUNCTION messages_by_address(text[],text[],bigint,bigint);`)
  await query(`DROP FUNCTION messages_by_address(text[],text[],bigint,bigint);`)

}


module.exports = { 
  DropMessageByAddressFunc,
}