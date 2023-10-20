const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const init = async () => {
  const server = Hapi.Server({
    port: 9000,
    host: 'localhost',
  });

  const books = [];

  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
      } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku'
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        }).code(400);
      }

      const bookId = nanoid();
      const book = {
        id: bookId,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished: pageCount === readPage,
        reading,
        insertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      books.push(book);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: bookId
        }
      }).code(201);
    }
  });

  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      if (books.length === 0) {
        return h.response({
          status: 'success',
          data: {
            books: []
          }
        });
      }

      const formattedBooks = books.map((book) => {
        return {
          id: book.id,
          name: book.name,
          publisher: book.publisher
        };
      });

      return h.response({
        status: 'success',
        data: {
          books: formattedBooks
        }
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const bookId = request.params.bookId;

      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan'
        }).code(404);
      }

      return h.response({
        status: 'success',
        data: {
          book
        }
      });
    }
  });

  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const bookId = request.params.bookId;
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
      } = request.payload;

      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan'
        }).code(404);
      }

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku'
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        }).code(400);
      }

      book.name = name;
      book.year = year;
      book.author = author;
      book.summary = summary;
      book.publisher = publisher;
      book.pageCount = pageCount;
      book.readPage = readPage;
      book.finished = pageCount === readPage;
      book.reading = reading;
      book.updatedAt = new Date().toISOString();

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui'
      }).code(200);
    }
  });

  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const bookId = request.params.bookId;
      const bookIndex = books.findIndex((b) => b.id === bookId);

      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan'
        }).code(404);
      }

      books.splice(bookIndex, 1);

      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus'
      }).code(200);
    }
  });

  await server.start();
  console.log(`Server berjalan pada port ${server.info.port}`);
};

init();
