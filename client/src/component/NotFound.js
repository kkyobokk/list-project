export default function Notfound() {
    const style = {
        width : "70%",
        height : "80%",
        backgroundColor : "#DDAAAA",
        margin : "auto auto",
        display : "flex",
        borderRadius : "30px",
    }

    const textStyle = {
        margin : 'auto auto',
    }

    return (
        <div style = {style}>
            <h1 style = {textStyle}> Page Not Found </h1>
        </div>
    )
}