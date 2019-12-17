namespace MyComponent.UI
{
    public enum SearchInitializedState
    {

        ParentInitialized,

        /// <summary>
        /// 
        /// </summary>
        ChildParameterInitialized,

        /// <summary>
        /// 
        /// </summary>
        DataFetched
    }

    public enum InitializedState
    {
        /// <summary>
        /// پس از آنکه ستون های گرید مقداردهی شدند.
        /// </summary>
        GridColumnInitialized,

        /// <summary>
        /// پس از آنکه فیلدهای گرید مقداردهی شدند
        /// </summary>
        GridFieldsIinitialized,

        /// <summary>
        /// بعد از اولین بازیابی دیتا
        /// </summary>
        FirstFetchData
    }
}
