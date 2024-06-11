const Book =require("../model/book.model");
const User =require("../model/user.model");

exports.addBooks =async(req,res)=>{
        console.log("controller");
        console.log(req.user);
        let email=req.user.email;

        const {bookname,authorname,imageUrl} = req.body;
        console.log(req.body);
        const user = await User.findOne({ email });
        console.log(user);
        if(!user || user.role!='admin'){
            return res.status(400).json({ message: "Unauthorized access" });
        }else{
            try{
                const newBook = new  Book({
                    bookname : bookname,
                    authorname:authorname,
                    imageUrl:imageUrl  
                });
                const book = await newBook.save();
                res.status(201).json({message:"Book added successfully",
                    _id: book._id,
                    bookname: book.bookname,
            });
            }catch(error){
                console.log("Error: ", error);
                res.status(500).json(error);
            }
        }
}

exports.bookList =async(req,res)=>{
    console.log("Hello");
    email = req.user.email;
        const user = await User.findOne({ email });
        
            try{
                const books = await Book.find();
                res.status(201).json(books);
            }catch(error){
                console.log("Error: ", error);
                res.status(500).json(error);
            }
        

}

//Edit a book 
 exports.editBook = async (req, res) => {
    const { id } = req.query;
    const { bookname, authorname, imageUrl } = req.body;
    try {
      const book = await Book.findByIdAndUpdate(id, { bookname, authorname, imageUrl }, { new: true });
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.json({message:"Book is updated successfully",book_id:book._id});
    } catch (error) {
      res.status(500).json({ error: 'Failed to edit book' });
    }
  };

  exports.getBook=async(req,res)=>{
    const { id } = req.query;
    try{
        const book = await Book.findById(id);
        if(!book){
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({message:"Book found successfully",book});
    }catch (error) {
        res.status(500).json({ error: 'Failed to fetch book' });
      }
  }

  exports.deleteBook =async(req,res)=>{
   
    const { id } = req.query;
    console.log("Delete id",id);
    try{
        const book = await Book.findByIdAndDelete(id);
        if(!book){
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({message:"Book deleted successfully",book});
    }catch (error) {
        res.status(500).json({ error: 'Failed to fetch book' });
      }
  }