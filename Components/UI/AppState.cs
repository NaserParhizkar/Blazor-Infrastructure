using System;

namespace MyComponent.UI
{
    public class AppState
    {
        public event Action OnChange;

        public void SetValue()
        {
            NotifyStateChanged();
        }

        private void NotifyStateChanged() => OnChange?.Invoke();
    }
}
