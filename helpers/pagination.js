 const functionPaginate = async (
  page,
  limit,
  // content: Query<(T & Document<any, any, any>)[], T & Document<any, any, any>, {}, Content & Document<any, any, any>>,
  content,
  // db:
  //   | Model<T & Document<any, any, any>, {}, {}>
  //   | Query<(T & Document<any, any, any>)[], T & Document<any, any, any>, {}, Content & Document<any, any, any>>,
  db
) => {
  //pagination
  const noPage = page || 1;
  const limitPerPage = limit || 10;
  const skip = (noPage - 1) * limitPerPage;
  content = await content.skip(skip).limit(limitPerPage);
  const data = await content;
  console.log(typeof db);
  const totalContent = typeof db === "number" ? db : await db.countDocuments();
  const totalPages = Math.ceil(totalContent / limit);
  return { data, totalContent, totalPages };
};
const functionPaginateNotification = async (
  page,
  limit,
  // content: Query<(T & Document<any, any, any>)[], T & Document<any, any, any>, {}, Content & Document<any, any, any>>,
  notifications,
  // db:
  //   | Model<T & Document<any, any, any>, {}, {}>
  //   | Query<(T & Document<any, any, any>)[], T & Document<any, any, any>, {}, Content & Document<any, any, any>>,
  db,
  user
) => {
  //pagination
  const noPage = page || 1;
  const limitPerPage = limit || 10;
  const skip = (noPage - 1) * limitPerPage;

  notifications = notifications.skip(skip).limit(limitPerPage);
  const data = await notifications;
  const totalContent =
    typeof db === "number"
      ? db
      : await db.countDocuments({
          userId: user._id,
        });

  const unreadCount = await notifications.countDocuments({
    userId: user._id,
    status: "unread",
  });
  const totalPages = Math.ceil(totalContent / limit);
  return { data, totalContent, totalPages, unreadCount };
};

module.exports = {functionPaginate}
