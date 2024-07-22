const Button =(

    {
        label ="Button",
        type= "Button",
        className ="",
        disabled=false


    }
)=>{
    return(
        <>
        <button  type ={type} disabled={disabled} className={`bg-[#354b5f] hover:bg-primary  text-white  font-bold py-2 px-4 rounded ${className}`}>
         {label}
         </button>
        </>
    )
}
export default Button;