using System.Linq;

namespace Common.Service
{
    public interface ISimpleService<TEntity>: IEntity
    {
        public IQueryable<TEntity> GetAll(TEntity entity);

        public TEntity Single(int id);

        public TEntity SingleOrDefault(int id);
    }
}
