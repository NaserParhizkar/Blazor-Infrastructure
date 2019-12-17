using System.Linq;

namespace Common.Service
{
    public class SimpleService<TEntity> : ISimpleService<TEntity> where TEntity : class
    {
        public MyContext Context { get; set; }

        public IQueryable<TEntity> GetAll(TEntity search)
        {
            return Context.Set<TEntity>();
        }

        public TEntity Single(int id)
        {
            throw new System.NotImplementedException();
        }

        public TEntity SingleOrDefault(int id)
        {
            throw new System.NotImplementedException();
        }

        public void Dispose()
        {
            Context?.Dispose();
        }
    }
}
